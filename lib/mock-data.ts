import type { TripData } from '@/types/trip'

export const mockTripData: TripData = {
  id: '1',
  title: '西安3天2晚',
  days: [
    {
      day: 1,
      cards: [
        {
          id: 'card-1',
          time: '09:00',
          endTime: '11:30',
          placeName: '大雁塔',
          type: '景点',
          tags: ['拍照出片', '必打卡'],
          address: '西安市雁塔区慈恩路1号',
          openTime: '08:00-18:00',
          tips: '建议早上去，人少光线好',
          notes: [
            {
              id: 'note-1',
              authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucy',
              authorName: '小红薯Lucy',
              content: '大雁塔真的超美！建议早上9点前到，人少拍照无遮挡。塔下的广场可以看喷泉表演...',
              thumbnail: 'https://images.unsplash.com/photo-1591017683614-6f2a3e0e9f3c?w=200&h=150&fit=crop'
            },
            {
              id: 'note-2',
              authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
              authorName: '旅行达人Emma',
              content: '大雁塔门票25元，登塔另收费。推荐傍晚来看夜景，灯光效果绝美...',
              thumbnail: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=200&h=150&fit=crop'
            }
          ]
        },
        {
          id: 'card-2',
          time: '12:00',
          endTime: '13:30',
          placeName: '长安大排档',
          type: '美食',
          tags: ['网红店', '排队预警'],
          address: '西安市雁塔区小寨西路26号',
          openTime: '10:00-22:00',
          tips: '招牌葫芦鸡必点，建议11点半前到避免排队',
          notes: [
            {
              id: 'note-3',
              authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Food',
              authorName: '吃货小分队',
              content: '葫芦鸡外酥里嫩，biangbiang面劲道，甑糕软糯香甜，都是必点！人均80左右...',
              thumbnail: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200&h=150&fit=crop'
            }
          ]
        },
        {
          id: 'card-3',
          time: '14:30',
          endTime: '17:30',
          placeName: '陕西历史博物馆',
          type: '景点',
          tags: ['免费预约', '文物震撼'],
          address: '西安市雁塔区小寨东路91号',
          openTime: '09:00-17:30（周一闭馆）',
          tips: '提前7天在官方公众号预约免费票',
          notes: [
            {
              id: 'note-4',
              authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=History',
              authorName: '博物馆探秘',
              content: '陕博绝对是西安必去！何家村窖藏、兽首玛瑙杯、鎏金舞马衔杯纹银壶都是国宝级文物...',
              thumbnail: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=200&h=150&fit=crop'
            }
          ]
        },
        {
          id: 'card-4',
          time: '18:30',
          endTime: '21:00',
          placeName: '回民街',
          type: '美食',
          tags: ['小吃天堂', '夜市氛围'],
          address: '西安市莲湖区北院门',
          openTime: '全天',
          tips: '建议从北院门入口进，避开主路走小巷更地道',
          notes: [
            {
              id: 'note-5',
              authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Street',
              authorName: '街头美食家',
              content: '老米家肉夹馍、魏家凉皮、红红酸菜炒米、贾三灌汤包，这些都是本地人推荐的！',
              thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=150&fit=crop'
            }
          ]
        }
      ],
      transits: {
        'card-1_card-2': { mode: '打车', duration: '15分钟', distance: '5.2公里' },
        'card-2_card-3': { mode: '步行', duration: '8分钟', distance: '600米' },
        'card-3_card-4': { mode: '地铁', duration: '25分钟', distance: '8公里' }
      }
    },
    {
      day: 2,
      cards: [
        {
          id: 'card-5',
          time: '08:00',
          endTime: '12:00',
          placeName: '秦始皇兵马俑',
          type: '景点',
          tags: ['世界奇迹', '必打卡'],
          address: '西安市临潼区秦陵北路',
          openTime: '08:30-17:00',
          tips: '建议请讲解员，120元/人，能深入了解历史',
          notes: [
            {
              id: 'note-6',
              authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wonder',
              authorName: '文化探索者',
              content: '一号坑最壮观，二号坑有跪射俑，三号坑是指挥部。铜车马展厅一定要去看！',
              thumbnail: 'https://images.unsplash.com/photo-1545156521-77bd85671d30?w=200&h=150&fit=crop'
            }
          ]
        },
        {
          id: 'card-6',
          time: '12:30',
          endTime: '14:00',
          placeName: '临潼悦椿温泉',
          type: '酒店',
          tags: ['温泉放松', '五星级'],
          address: '西安市临潼区悦椿东路8号',
          openTime: '24小时',
          tips: '可以只泡温泉，不住宿，约298元/人',
          notes: [
            {
              id: 'note-7',
              authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Spa',
              authorName: '度假达人',
              content: '看完兵马俑来这里泡温泉太舒服了！室外池可以看山景，服务也很好',
              thumbnail: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200&h=150&fit=crop'
            }
          ]
        },
        {
          id: 'card-7',
          time: '16:00',
          endTime: '18:00',
          placeName: '华清宫',
          type: '景点',
          tags: ['杨贵妃', '历史遗迹'],
          address: '西安市临潼区华清路38号',
          openTime: '07:00-19:00',
          tips: '晚上有《长恨歌》演出，提前买票',
          notes: [
            {
              id: 'note-8',
              authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Palace',
              authorName: '历史控',
              content: '华清池就是杨贵妃沐浴的地方，海棠汤很有意境。骊山上还可以看西安全景',
              thumbnail: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=200&h=150&fit=crop'
            }
          ]
        }
      ],
      transits: {
        'card-5_card-6': { mode: '打车', duration: '10分钟', distance: '3公里' },
        'card-6_card-7': { mode: '步行', duration: '15分钟', distance: '1.2公里' }
      }
    }
  ]
}
