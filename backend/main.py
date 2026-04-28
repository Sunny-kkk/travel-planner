import os
import json
import re
from typing import List, Optional, Dict, Any

import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()  # 从 backend/.env 或环境变量加载

app = FastAPI(title="Travel Plan Extractor API")

# CORS：允许前端 localhost:3000
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000")
ALLOW_ORIGINS = [o.strip() for o in CORS_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DASHSCOPE_API_KEY = os.getenv("DASHSCOPE_API_KEY")
AMAP_API_KEY = os.getenv("AMAP_API_KEY")

DASH_SCOPE_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1"
QWEN_MODEL = "qwen-plus"

SYSTEM_PROMPT = (
    "你是一个专业的旅行行程提取助手。用户会给你一段从小红书复制的旅行攻略笔记文本，请提取其中所有出现的地点信息，并按以下 JSON 格式输出，不要输出任何其他内容。\n\n"
    "输出格式：\n"
    "{\n"
    "  \"title\": \"概括这次旅行的标题\",\n"
    "  \"days\": [\n"
    "    {\n"
    "      \"day\": 1,\n"
    "      \"items\": [\n"
    "        {\n"
    "          \"time\": \"建议游玩时间段，如 09:00-12:00;若文中没有明确时间则填空字符串\",\n"
    "          \"name\": \"地点名称\",\n"
    "          \"type\": \"景点/美食/购物/酒店/其他\",\n"
    "          \"tags\": [\"文中提到的关键标签，如 网红打卡、排队预警、提前预约 等\"],\n"
    "          \"tips\": \"文中提到的注意事项或小贴士，没有则填 无\",\n"
    "          \"confidence\": \"高/中/低 (根据文本描述的明确程度判断)\"\n"
    "        }\n"
    "      ]\n"
    "    }\n"
    "  ]\n"
    "}\n"
)

class ExtractRequest(BaseModel):
    text: str = Field(..., description="用户粘贴的完整攻略文本")

class ExportMapRequest(BaseModel):
    places: List[str]

class RoutePlanRequest(BaseModel):
    from_place: str
    to_place: str
    mode: str = Field(..., description="步行/公交/地铁/自驾/骑行/打车")
    depart_time: Optional[str] = Field(default=None, description="HH:mm")

class GeocodeResult(BaseModel):
    place: str
    location: str
    city: Optional[str] = None

def extract_json_from_text(s: str) -> Optional[Dict[str, Any]]:
    """
    尝试从模型返回文本中提取 JSON:
    - 若直接是 JSON:直接解析
    - 若模型夹带了其他内容：用正则抓取首尾大括号之间的内容再解析
    """
    try:
        return json.loads(s)
    except Exception:
        pass

    # 尝试提取第一个{到最后一个}
    m = re.search(r"\{.*\}", s, flags=re.S)
    if not m:
        return None
    candidate = m.group(0)
    try:
        return json.loads(candidate)
    except Exception:
        return None

def geocode_place(place: str) -> GeocodeResult:
    try:
        r = requests.get(
            "https://restapi.amap.com/v3/geocode/geo",
            params={"key": AMAP_API_KEY, "address": place},
            timeout=60,
        )
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"{place} 地理编码请求失败: {str(e)}")

    if r.status_code != 200:
        raise HTTPException(status_code=502, detail=f"{place} 地理编码HTTP异常: {r.text[:500]}")

    try:
        j = r.json()
    except Exception:
        raise HTTPException(status_code=502, detail=f"{place} 地理编码返回非JSON: {r.text[:500]}")

    if j.get("status") != "1" or not j.get("geocodes"):
        info = j.get("info", "未知失败")
        raise HTTPException(status_code=502, detail=f"{place} 地理编码失败: {info}")

    geo = j["geocodes"][0]
    location = geo.get("location")
    city = geo.get("city") or geo.get("province") or ""
    if isinstance(city, list):
        city = city[0] if city else ""

    if not location or "," not in location:
        raise HTTPException(status_code=502, detail=f"{place} 经纬度解析失败")

    return GeocodeResult(place=place, location=location, city=city or None)


def seconds_to_text(seconds: int) -> str:
    minutes = max(1, round(seconds / 60))
    return f"约{minutes}分钟"


def meters_to_text(meters: int) -> str:
    if meters >= 1000:
        return f"{meters / 1000:.1f}公里"
    return f"{meters}米"


def build_amap_strategy(mode: str) -> str:
    if mode == "步行":
        return "步行"
    if mode in ("公交", "地铁"):
        return "公共交通"
    if mode == "骑行":
        return "骑行"
    if mode == "打车":
        return "打车(按驾车估算)"
    return "驾车"


def calc_route(from_place: str, to_place: str, mode: str, depart_time: Optional[str] = None) -> Dict[str, Any]:
    if not AMAP_API_KEY:
        raise HTTPException(status_code=500, detail="缺少环境变量：AMAP_API_KEY")

    from_geo = geocode_place(from_place)
    to_geo = geocode_place(to_place)

    origin = from_geo.location
    destination = to_geo.location

    if mode == "步行":
        r = requests.get(
            "https://restapi.amap.com/v3/direction/walking",
            params={"key": AMAP_API_KEY, "origin": origin, "destination": destination},
            timeout=60,
        )
        j = r.json()
        if j.get("status") != "1" or not j.get("route", {}).get("paths"):
            raise HTTPException(status_code=502, detail=f"步行路线计算失败: {j.get('info', '未知错误')}")
        path = j["route"]["paths"][0]
        duration = int(path.get("duration", 0))
        distance = int(path.get("distance", 0))
        return {
            "mode": mode,
            "duration": seconds_to_text(duration),
            "distance": meters_to_text(distance),
            "strategy": build_amap_strategy(mode),
        }

    if mode == "骑行":
        r = requests.get(
            "https://restapi.amap.com/v4/direction/bicycling",
            params={"key": AMAP_API_KEY, "origin": origin, "destination": destination},
            timeout=60,
        )
        j = r.json()
        if j.get("errcode") not in (0, "0") or not j.get("data", {}).get("paths"):
            raise HTTPException(status_code=502, detail=f"骑行路线计算失败: {j.get('errmsg', '未知错误')}")
        path = j["data"]["paths"][0]
        duration = int(path.get("duration", 0))
        distance = int(path.get("distance", 0))
        return {
            "mode": mode,
            "duration": seconds_to_text(duration),
            "distance": meters_to_text(distance),
            "strategy": build_amap_strategy(mode),
        }

    if mode in ("公交", "地铁"):
        city = from_geo.city or to_geo.city
        r = requests.get(
            "https://restapi.amap.com/v5/direction/transit/integrated",
            params={
                "key": AMAP_API_KEY,
                "origin": origin,
                "destination": destination,
                "city1": city,
                "city2": city,
                "strategy": "0" if mode == "公交" else "2",
            },
            timeout=60,
        )
        j = r.json()
        transits = j.get("route", {}).get("transits") or []
        if j.get("status") != "1" or not transits:
            raise HTTPException(status_code=502, detail=f"{mode}路线计算失败: {j.get('info', '未知错误')}")
        path = transits[0]
        duration = int(path.get("duration", 0))
        distance = int(path.get("distance", 0))
        return {
            "mode": mode,
            "duration": seconds_to_text(duration),
            "distance": meters_to_text(distance),
            "strategy": build_amap_strategy(mode),
        }

    r = requests.get(
        "https://restapi.amap.com/v3/direction/driving",
        params={
            "key": AMAP_API_KEY,
            "origin": origin,
            "destination": destination,
            "strategy": "0" if mode == "自驾" else "32",
        },
        timeout=60,
    )
    j = r.json()
    if j.get("status") != "1" or not j.get("route", {}).get("paths"):
        raise HTTPException(status_code=502, detail=f"{mode}路线计算失败: {j.get('info', '未知错误')}")
    path = j["route"]["paths"][0]
    duration = int(path.get("duration", 0))
    distance = int(path.get("distance", 0))
    return {
        "mode": mode,
        "duration": seconds_to_text(duration),
        "distance": meters_to_text(distance),
        "strategy": build_amap_strategy(mode),
    }

@app.post("/api/route-plan")
def route_plan(req: RoutePlanRequest):
    from_place = (req.from_place or "").strip()
    to_place = (req.to_place or "").strip()
    if not from_place or not to_place:
        raise HTTPException(status_code=400, detail="from_place 和 to_place 不能为空")

    return calc_route(
        from_place=from_place,
        to_place=to_place,
        mode=req.mode,
        depart_time=req.depart_time,
    )

@app.post("/api/extract")
def extract(plan: ExtractRequest):
    if not DASHSCOPE_API_KEY:
        raise HTTPException(status_code=500, detail="缺少环境变量：DASHSCOPE_API_KEY")

    text = (plan.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="text 不能为空")

    headers = {
        "Authorization": f"Bearer {DASHSCOPE_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": QWEN_MODEL,
        "temperature": 0.1,
        "max_tokens": 2000,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": text},
        ],
    }

    try:
        resp = requests.post(
            f"{DASH_SCOPE_BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
            timeout=120,
        )
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"千问请求失败: {str(e)}")

    if resp.status_code != 200:
        detail = resp.text[:2000]
        raise HTTPException(status_code=502, detail=f"千问响应异常: {detail}")

    data = resp.json()
    content = (
        data.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
    )

    parsed = extract_json_from_text(content or "")
    if not parsed:
        raise HTTPException(status_code=502, detail="模型返回内容无法解析为 JSON")

    if not isinstance(parsed, dict) or "days" not in parsed:
        raise HTTPException(status_code=502, detail="模型返回结构不完整，缺少 days 字段")

    if "title" not in parsed or not isinstance(parsed.get("title"), str):
        parsed["title"] = "我的旅行计划"

    if not isinstance(parsed.get("days"), list):
        parsed["days"] = []

    return parsed

@app.post("/api/export-map")
def export_map(req: ExportMapRequest):
    if not AMAP_API_KEY:
        raise HTTPException(status_code=500, detail="缺少环境变量：AMAP_API_KEY")

    places = [p.strip() for p in req.places if p and p.strip()]
    if not places:
        return {"error": "地点解析失败", "detail": "places 为空"}

    # 地理编码：每个地点调用一次
    coords: List[Dict[str, str]] = []  # {place, location}
    for place in places:
        try:
            r = requests.get(
                "https://restapi.amap.com/v3/geocode/geo",
                params={"key": AMAP_API_KEY, "address": place},
                timeout=60,
            )
        except requests.RequestException as e:
            return {"error": "地点解析失败", "detail": f"{place} 地理编码请求失败: {str(e)}"}

        if r.status_code != 200:
            return {"error": "地点解析失败", "detail": f"{place} 地理编码HTTP异常: {r.text[:500]}"} 

        try:
            j = r.json()
        except Exception:
            return {"error": "地点解析失败", "detail": f"{place} 地理编码返回非JSON: {r.text[:500]}"}

        # AMap：{"status":"1","geocodes":[{"location":"116.481488,39.990464"}]}
        if j.get("status") != "1" or not j.get("geocodes"):
            # AMap 可能会返回 info/message
            info = j.get("info", "未知失败")
            return {"error": "地点解析失败", "detail": f"{place} 地理编码失败: {info}"}

        location = j["geocodes"][0].get("location")
        if not location or "," not in location:
            return {"error": "地点解析失败", "detail": f"{place} 经纬度解析失败"}

        coords.append({"place": place, "location": location})

    # 生成 URL
    # 约定：location 格式 "lng,lat"
    if len(coords) == 1:
        lnglat = coords[0]["location"]
        # marker 链接（可直接打开点位）
        map_url = f"https://uri.amap.com/marker?position={lnglat}&name={requests.utils.quote(coords[0]['place'])}"
        return {"map_url": map_url}

    from_loc = coords[0]["location"]
    to_loc = coords[-1]["location"]
    via_locs = [c["location"] for c in coords[1:-1]]

    via_part = ""
    if via_locs:
        via_part = "&via=" + ";".join(via_locs)

    map_url = f"https://uri.amap.com/navigation?from={from_loc}&to={to_loc}{via_part}"
    return {"map_url": map_url}
