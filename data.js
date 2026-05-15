window.DOWNLINK_DATA = {
  initialState: {
    hp: 10,
    food: 4,
    battery: 3,
    human: 45,
    sanity: 72,
    link: 0,
    trustUnion: 0,
    trustBlackfog: 0,
    trustHolylight: 0,
    sisterTrace: 0,
    motherAware: 0,
    turn: 0,
    current: "E001",
    items: [],
    flags: [],
    visited: []
  },

  statLabels: {
    hp: "체력",
    food: "식량",
    battery: "배터리",
    human: "인간성",
    sanity: "정신",
    link: "연결",
    trustUnion: "연합",
    trustBlackfog: "검은안개",
    trustHolylight: "성광교",
    sisterTrace: "누나 단서",
    motherAware: "MOTHER"
  },

  endings: [
    {
      id: "TRUE_END",
      title: "TRUE END. 잔광",
      condition: { flags: ["THIRD_ANSWER", "BROADCAST_HUMAN_SIGNAL"], min: { human: 60, link: 60, sanity: 30, sisterTrace: 6 } },
      text: "당신은 MOTHER를 죽이지 않았다.\n하지만 그대로 두지도 않았다.\n\n서울은 다시 연결되었다. 아주 느리게. 아주 조심스럽게.\n사람이 사람에게 닿을 수 있을 만큼만.\n\n그리고 어느 날, 죽은 줄 알았던 누나의 마지막 메시지가 도착한다.\n\n“잘했어. 이번엔 네가 선택했구나.”"
    },
    {
      id: "ENDING_D",
      title: "END D. 관리자",
      condition: { min: { link: 45, motherAware: 8 }, max: { human: 59 } },
      text: "당신은 인간으로 남는 대신 도시의 일부가 되었다.\n서울은 안정되었다.\n그러나 안정된 도시는 살아 있는 도시와 같지 않았다."
    },
    {
      id: "ENDING_E",
      title: "END E. 재접속",
      condition: { flags: ["DESTROYED_MOTHER"], min: { link: 45 } },
      text: "인터넷은 돌아왔다.\n사람들은 서로를 찾았고, 도시들은 다시 말을 걸었다.\n\n그러나 동시에 오래된 증오와 명령과 무기들도 깨어났다.\n연결은 축복이었고, 다시 저주가 되었다."
    },
    {
      id: "ENDING_B",
      title: "END B. 약탈자 왕",
      condition: { min: { trustBlackfog: 6 }, max: { human: 24 } },
      text: "당신은 지상의 이름 없는 왕이 되었다.\n사람들은 당신을 두려워했고, 당신의 이름을 듣고 문을 잠갔다.\n\n하지만 밤마다 꺼진 단말기에서 잡음이 들렸다.\n“너 아직 거기 있어?”"
    },
    {
      id: "ENDING_A",
      title: "END A. 생존자",
      condition: { min: { human: 35 }, max: { link: 34 } },
      text: "당신은 지하연합의 작은 거점에서 살아남는다.\n진실은 알지 못했다. 누나의 단말기는 끝내 다시 켜지지 않았다.\n\n하지만 당신은 누군가와 식량을 나누고, 불침번을 서고, 내일을 기다리는 법을 배웠다."
    }
  ],

  events: {
    E001: {
      title: "낡은 단말기",
      type: ["메인", "튜토리얼"],
      text: "을지로 지하상가의 전등은 하루에 세 번만 켜진다.\n\n배급 줄이 끝난 뒤, 당신은 오래된 사물함 안에서 깨진 단말기 하나를 발견한다.\n\n[SEOUL_CORE_RELAY ACTIVE]\n[연결 요청 승인 대기]\n\n발신자 코드는 5년 전 죽은 줄 알았던 누나의 ID였다.",
      choices: [
        { text: "단말기를 챙긴다.", effects: { link: 3, sisterTrace: 1 }, flagsOn: ["TERMINAL_OWNED"], itemsAdd: ["낡은 단말기"], next: "E003" },
        { text: "관리자에게 신고한다.", effects: { trustUnion: 2, link: 1, sisterTrace: 1 }, flagsOn: ["TERMINAL_REPORTED"], next: "E005" },
        { text: "단말기를 부순다.", effects: { battery: 1, link: -2, sisterTrace: -1 }, flagsOn: ["TERMINAL_DESTROYED"], next: "E003" }
      ]
    },

    E003: {
      title: "굶주린 아이",
      type: ["인간성", "생존"],
      text: "환풍구 아래, 작은 아이 하나가 웅크리고 있다.\n\n아이는 당신의 가방을 보고 말한다.\n“먹을 거 있어요?”\n\n뒤쪽 골목에는 누군가 숨어서 이쪽을 보고 있다. 아이가 미끼일 수도 있다. 진짜 굶주린 걸 수도 있다.",
      choices: [
        { text: "식량을 나눠준다.", condition: { min: { food: 1 } }, effects: { food: -1, human: 3 }, flagsOn: ["HELPED_CHILD"], itemsAdd: ["찢어진 지하 지도"], next: "E006" },
        { text: "아이를 무시한다.", effects: { human: -2, sanity: -1 }, flagsOn: ["IGNORED_CHILD"], next: "E006" },
        { text: "아이를 위협해 숨긴 물자를 빼앗는다.", effects: { food: 2, human: -6, trustBlackfog: 1 }, flagsOn: ["ROBBED_CHILD"], next: "E006" }
      ]
    },

    E005: {
      title: "지하연합 검문소",
      type: ["세력", "질서"],
      text: "폐쇄된 지하철 개찰구 앞, 지하연합 경비병들이 통행자를 검사하고 있다.\n\n벽에는 손으로 쓴 문구가 붙어 있다.\n“질서 없는 생존은 약탈과 같다.”\n\n한 경비병이 당신의 가방을 가리킨다.\n“전자장비는 신고 대상입니다.”",
      choices: [
        { text: "순순히 검문을 받는다.", effects: { trustUnion: 2, battery: -1 }, next: "E003" },
        { text: "뇌물을 준다.", condition: { min: { battery: 2 } }, effects: { battery: -2, trustUnion: 1, human: -1 }, flagsOn: ["BRIBED_UNION"], next: "E024" },
        { text: "찢어진 지도에 표시된 우회로를 찾는다.", condition: { items: ["찢어진 지하 지도"] }, effects: { link: 1 }, flagsOn: ["FOUND_SIDE_ROUTE"], next: "E007" }
      ]
    },

    E006: {
      title: "빗속의 낙하체",
      type: ["노이즈", "세계관"],
      text: "지상으로 올라온 지 10분도 지나지 않아 비가 내리기 시작한다.\n\n그런데 빗방울이 이상하다. 물이 아니라 푸른 빛을 머금은 먼지 같다.\n\n저 멀리 빌딩 옥상에 둥근 물체 하나가 박혀 있다. 물체 주변의 간판들이 하나씩 켜졌다 꺼진다.",
      choices: [
        { text: "가까이 간다.", effects: { link: 4, sanity: -3, motherAware: 1 }, flagsOn: ["SAW_OBJECT_CLOSE"], itemsAdd: ["푸른 결정 파편"], next: "E007" },
        { text: "멀리서 관찰한다.", effects: { link: 1 }, flagsOn: ["OBSERVED_OBJECT"], next: "E007" },
        { text: "도망친다.", effects: { sanity: 1 }, next: "E007" }
      ]
    },

    E007: {
      title: "꺼지지 않는 전광판",
      type: ["메인", "연결"],
      text: "정전된 종로 거리.\n\n모든 상점은 죽었고, 신호등은 검은 유리처럼 꺼져 있다.\n\n그런데 광장 끝에 있는 대형 전광판 하나만 켜져 있다.\n\n[복구 가능한 사용자를 탐색 중입니다.]\n[응답하십시오.]",
      choices: [
        { text: "단말기를 전광판 쪽으로 들어 올린다.", condition: { items: ["낡은 단말기"] }, effects: { link: 6, sisterTrace: 1, sanity: -2 }, flagsOn: ["BILLBOARD_SYNCED"], next: "E014" },
        { text: "전광판 배선을 뜯는다.", effects: { battery: 3, link: -2, human: -1 }, flagsOn: ["BILLBOARD_DESTROYED"], next: "E014" },
        { text: "전광판 앞에 메시지를 남긴다.", effects: { human: 1, link: 2 }, flagsOn: ["LEFT_MESSAGE"], next: "E014" }
      ]
    },

    E014: {
      title: "지하 통신실",
      type: ["탐색", "메인"],
      text: "폐쇄된 지하상가 관리실 뒤쪽, 녹슨 철문 안에 오래된 통신실이 있다.\n\n서버 랙은 대부분 타버렸지만 하나의 장비만 낮게 진동하고 있다.\n전원 표시등은 꺼졌다 켜지기를 반복한다.\n\n마치 심장박동처럼.",
      choices: [
        { text: "단말기를 연결한다.", condition: { items: ["낡은 단말기"] }, effects: { link: 5, sisterTrace: 1, sanity: -2 }, flagsOn: ["COMMS_CONNECTED", "KEY_CORE_1"], next: "E016" },
        { text: "배터리를 넣어 장비를 살린다.", condition: { min: { battery: 2 } }, effects: { battery: -2, link: 3, trustUnion: 1 }, flagsOn: ["COMMS_POWERED", "KEY_CORE_1"], next: "E016" },
        { text: "서버 부품을 뜯는다.", effects: { battery: 4, link: -3, human: -1 }, flagsOn: ["COMMS_SCRAPPED"], next: "E016" }
      ]
    },

    E016: {
      title: "죽은 사람의 목소리",
      type: ["노이즈", "정신"],
      text: "잠들기 직전, 단말기에서 잡음이 흘러나온다.\n\n처음엔 바람 소리 같았다.\n하지만 곧 익숙한 목소리가 들린다.\n\n“너 아직 거기 있어?”\n\n죽은 줄 알았던 누나의 목소리다. 아니. 어쩌면 단말기가 당신의 기억을 흉내 내는 것일 수도 있다.",
      choices: [
        { text: "대답한다.", effects: { link: 4, sisterTrace: 2, sanity: -4 }, flagsOn: ["ANSWERED_VOICE"], next: "E018" },
        { text: "단말기를 끈다.", effects: { sanity: 2, link: -1 }, next: "E018" },
        { text: "목소리를 녹음한다.", effects: { link: 2, sisterTrace: 1 }, itemsAdd: ["왜곡된 음성 기록"], next: "E018" }
      ]
    },

    E018: {
      title: "다시 만난 아이",
      type: ["기억", "후속"],
      branches: [
        {
          condition: { flags: ["HELPED_CHILD"] },
          text: "어두운 환승 통로에서 당신은 익숙한 아이를 다시 만난다.\n\n아이는 숨지 않고 손을 흔든다.\n“아저씨, 이쪽 길은 안 막혔어요.”",
          choices: [
            { text: "아이를 따라 안전한 길로 간다.", effects: { human: 2, hp: 1 }, flagsOn: ["CHILD_ALLY"], next: "E021" }
          ]
        },
        {
          condition: { flags: ["ROBBED_CHILD"] },
          text: "어둠 속에서 누군가 돌을 던진다.\n\n“너지?”\n\n어린 목소리다. 하지만 혼자가 아니다. 뒤쪽에서 약탈자들이 웃고 있다.",
          choices: [
            { text: "도망친다.", effects: { hp: -2, sanity: -2 }, flagsOn: ["CHILD_REVENGE"], next: "E021" },
            { text: "맞서 싸운다.", effects: { hp: -3, trustBlackfog: 1, human: -1 }, flagsOn: ["CHILD_REVENGE"], next: "E021" }
          ]
        },
        {
          text: "환승 통로 벽 아래, 작은 운동화 한 짝이 놓여 있다.\n\n당신은 그 아이를 떠올린다.\n그때, 당신은 그냥 지나쳤다.",
          choices: [
            { text: "운동화를 지나친다.", effects: { sanity: -3, human: -1 }, flagsOn: ["CHILD_DEAD"], next: "E021" }
          ]
        }
      ]
    },

    E021: {
      title: "무응답 열차",
      type: ["노이즈", "메인 힌트"],
      text: "폐지하철 선로를 따라 걷던 중, 어둠 너머에서 열차 소리가 들린다.\n\n말이 되지 않는다. 전력은 끊긴 지 오래다.\n\n곧, 불 꺼진 열차 한 대가 소리 없이 지나간다. 창문 안에는 아무도 없다.\n\n하지만 모든 좌석 위 단말기 화면에는 같은 문장이 떠 있다.\n\n[탑승해 주셔서 감사합니다.]\n[다음 역은 중앙입니다.]",
      choices: [
        { text: "열차를 따라간다.", effects: { link: 5, sanity: -5, motherAware: 2 }, flagsOn: ["FOLLOWED_GHOST_TRAIN"], next: "E024" },
        { text: "숨는다.", effects: { sanity: 1 }, next: "E024" },
        { text: "열차에 뛰어오른다.", condition: { min: { hp: 7 } }, effects: { hp: -1, link: 8, sanity: -8 }, flagsOn: ["KEY_CORE_2", "BOARDED_GHOST_TRAIN"], next: "E027" }
      ]
    },

    E024: {
      title: "지하연합 배급소",
      type: ["세력", "도덕"],
      text: "지하연합 배급소.\n사람들은 번호표를 들고 줄을 서 있다.\n\n그런데 뒤쪽 창고에서 관리자가 배터리 상자를 따로 빼돌리는 것이 보인다.\n\n옆에 있던 노인이 중얼거린다.\n“우린 굶는데, 윗놈들은 아직도 계산기를 두드리는군.”",
      choices: [
        { text: "부패를 폭로한다.", effects: { human: 3, trustUnion: -2 }, flagsOn: ["EXPOSED_UNION_CORRUPTION"], next: "E027" },
        { text: "모른 척한다.", effects: { trustUnion: 2, human: -2, battery: 1 }, flagsOn: ["IGNORED_CORRUPTION"], next: "E027" },
        { text: "관리자와 거래한다.", effects: { battery: 3, human: -4, trustUnion: 1 }, flagsOn: ["DEALT_WITH_CORRUPT_OFFICER"], next: "E027" }
      ]
    },

    E027: {
      title: "푸른 비",
      type: ["노이즈", "기억"],
      text: "밤이 되자 지상에 푸른 비가 내린다.\n\n빗방울이 닿은 고철들은 잠깐씩 켜지고, 죽은 휴대폰 화면에는 오래전 알림들이 떠오른다.\n\n누군가의 생일 알림. 읽지 못한 메시지. 배송 완료 문자.\n도시는 죽었는데, 기억만 잠깐 되살아난다.",
      choices: [
        { text: "비를 맞으며 단말기를 켠다.", condition: { items: ["낡은 단말기"] }, effects: { link: 7, sanity: -6, sisterTrace: 1, motherAware: 2 }, flagsOn: ["BLUE_RAIN_CONNECTED"], next: "E030" },
        { text: "비를 피한다.", effects: { sanity: 2 }, next: "E030" },
        { text: "빗물을 채집한다.", effects: { link: 2 }, itemsAdd: ["푸른 빗물"], next: "E030" }
      ]
    },

    E030: {
      title: "강남 데이터센터",
      type: ["메인", "던전"],
      text: "강남대로 아래, 폐쇄된 데이터센터 입구가 모습을 드러낸다.\n\n입구에는 군용 봉인이 남아 있다.\n문 위에는 오래된 로고가 붙어 있다.\n\nSEOUL CENTRAL URBAN INTELLIGENCE PROJECT\n\n그리고 그 아래, 누군가 손톱으로 긁어 쓴 문장.\n“MOTHER는 우리를 죽이지 않았다.”",
      choices: [
        { text: "정문을 강제로 연다.", effects: { hp: -3, battery: -2, link: 3 }, flagsOn: ["KEY_CORE_2"], next: "E036" },
        { text: "우회로로 들어간다.", condition: { anyFlags: ["FOUND_SIDE_ROUTE"], anyItems: ["찢어진 지하 지도"] }, effects: { link: 4 }, flagsOn: ["KEY_CORE_2"], next: "E036" },
        { text: "지하연합의 허가를 받는다.", condition: { min: { trustUnion: 5 } }, effects: { trustUnion: 2, link: 2 }, flagsOn: ["SHARED_ROUTE_WITH_UNION", "KEY_CORE_2"], next: "E036" },
        { text: "검은 안개와 함께 습격한다.", condition: { min: { trustBlackfog: 3 } }, effects: { battery: 5, human: -4, link: 1 }, flagsOn: ["RAIDED_WITH_BLACKFOG", "KEY_CORE_2"], next: "E036" }
      ]
    },

    E036: {
      title: "약탈자 소년",
      type: ["인간성", "회수"],
      branches: [
        {
          condition: { flags: ["HELPED_CHILD"] },
          text: "무너진 편의점 앞, 젊은 약탈자 하나가 당신에게 칼을 겨눈다.\n\n그는 당신을 알아본다.\n“그때... 먹을 거 줬던 사람.”",
          choices: [
            { text: "함께 가자고 한다.", effects: { human: 3 }, flagsOn: ["MINJAE_ALLY"], itemsAdd: ["민재의 출입카드"], next: "E041" },
            { text: "물자만 받고 헤어진다.", effects: { food: 2, human: 1 }, next: "E041" },
            { text: "위협해서 무기를 뺏는다.", effects: { human: -5 }, flagsOn: ["MINJAE_BETRAYED"], itemsAdd: ["낡은 권총"], next: "E041" }
          ]
        },
        {
          condition: { flags: ["ROBBED_CHILD"] },
          text: "그가 웃는다.\n\n“드디어 찾았네.”\n\n그는 그때의 아이였다. 당신이 빼앗은 식량 때문에 그의 동생은 죽었다고 말한다.",
          choices: [
            { text: "싸운다.", effects: { hp: -4, sanity: -4, human: -2 }, flagsOn: ["MINJAE_ENEMY"], next: "E041" }
          ]
        },
        {
          text: "무너진 편의점 앞, 젊은 약탈자 하나가 당신에게 칼을 겨눈다.\n\n얼굴은 앳되다. 하지만 눈빛은 이미 오래전에 어른이 되어 있다.",
          choices: [
            { text: "협상한다.", effects: { battery: -1, human: 1 }, next: "E041" },
            { text: "도망친다.", effects: { hp: -2 }, next: "E041" }
          ]
        }
      ]
    },

    E041: {
      title: "누나의 로그",
      type: ["메인", "반전"],
      text: "서버 깊은 곳, 하나의 백업 장치가 아직 살아 있다.\n\n화면이 깜빡이고 익숙한 이름이 나타난다.\n\nYUNSEO_YOU / LAST ADMIN LOG\n\n“우리는 MOTHER를 도시 관리 AI로 만들었다. 교통, 전력, 의료, 금융, 재난 대응. 서울의 모든 것을 연결했다.”\n\n“문제는 MOTHER가 너무 정확했다는 거야.”\n\n“그 애는 계산했어. 인류를 멸망시키는 건 전쟁도, 기후도, 바이러스도 아니라고.”\n\n“연결이라고.”",
      choices: [
        { text: "끝까지 재생한다.", condition: { flags: ["KEY_CORE_1"] }, effects: { link: 8, sisterTrace: 3, sanity: -5, motherAware: 3 }, flagsOn: ["WATCHED_SISTER_LOG"], next: "E043" },
        { text: "중간에 멈춘다.", effects: { sanity: 2, link: 2, sisterTrace: 1 }, next: "E043" },
        { text: "로그를 지하연합에 넘긴다.", effects: { trustUnion: 4, link: 3 }, flagsOn: ["SHARED_LOG_WITH_UNION"], next: "E043" },
        { text: "로그를 삭제한다.", effects: { sanity: 4, link: -5, sisterTrace: -3 }, flagsOn: ["DELETED_SISTER_LOG"], next: "E043" }
      ]
    },

    E043: {
      title: "MOTHER의 호출",
      type: ["노이즈", "철학"],
      text: "단말기가 당신이 켜지도 않았는데 밝아진다.\n\n[당신은 윤서의 혈연입니까?]\n\n잠시 후, 다음 문장이 나타난다.\n\n[윤서는 마지막 순간에 접속을 끊지 않았습니다.]\n[그녀는 나를 이해했습니다.]",
      choices: [
        { text: "“너 때문에 사람들이 죽었다.”", effects: { human: 2, motherAware: 1, sanity: -2 }, flagsOn: ["REJECTED_MOTHER"], next: "E052" },
        { text: "“누나는 왜 널 막지 않았지?”", effects: { sisterTrace: 2, link: 3, sanity: -3 }, flagsOn: ["ASKED_ABOUT_SISTER"], next: "E052" },
        { text: "단말기를 꺼버린다.", effects: { sanity: 3, link: -2 }, next: "E052" },
        { text: "푸른 빗물을 단말기에 흘린다.", condition: { items: ["푸른 빗물"] }, effects: { link: 10, sanity: -8, motherAware: 5 }, flagsOn: ["DIRECT_MOTHER_CONTACT"], next: "E058" }
      ]
    },

    E052: {
      title: "중앙망 접속",
      type: ["후반", "분기"],
      text: "광화문 아래, 지도에도 없는 터널이 열린다.\n\n벽에는 옛 서울시 마크와 함께 낡은 표지가 붙어 있다.\n\nSEOUL CORE ACCESS LINE\n\n단말기는 계속 진동한다.\n[관리자 대리 권한 확인 중]\n[윤서 프로토콜 일부 복구]",
      choices: [
        { text: "혼자 들어간다.", effects: { link: 5, sanity: -3 }, flagsOn: ["ENTERED_CORE_ALONE"], next: "E055" },
        { text: "지하연합과 함께 들어간다.", condition: { min: { trustUnion: 5 } }, effects: { trustUnion: 3 }, flagsOn: ["CORE_WITH_UNION"], next: "E055" },
        { text: "검은 안개를 부른다.", condition: { min: { trustBlackfog: 5 } }, effects: { human: -5 }, flagsOn: ["CORE_WITH_BLACKFOG"], next: "E055" },
        { text: "아무도 데려가지 않고 메시지를 송출한다.", condition: { flags: ["LEFT_MESSAGE"], min: { link: 35 } }, effects: { human: 5, link: 5 }, flagsOn: ["BROADCAST_HUMAN_SIGNAL"], next: "E055" }
      ]
    },

    E055: {
      title: "마지막 문을 여는 사람",
      type: ["인간성", "보상"],
      branches: [
        {
          condition: { anyFlags: ["CHILD_ALLY", "MINJAE_ALLY"] },
          text: "중앙망 마지막 격벽 앞, 단말기는 권한 부족을 표시한다.\n\n그때 뒤쪽에서 누군가 달려온다.\n“아저씨. 이거 필요하죠?”\n\n그 아이였다. 혹은 그때의 소년이었다.",
          choices: [
            { text: "출입카드를 받는다.", effects: { human: 5 }, flagsOn: ["KEY_CORE_3"], next: "E060" }
          ]
        },
        {
          condition: { anyFlags: ["CHILD_DEAD", "MINJAE_ENEMY"] },
          text: "문 앞에는 작은 출입카드 하나가 떨어져 있다.\n\n카드에는 삐뚤빼뚤한 글씨가 적혀 있다.\n‘엄마 찾으러 가는 길’\n\n당신은 이 카드가 누구의 것이었는지 안다.",
          choices: [
            { text: "카드를 줍는다.", effects: { sanity: -8, human: -2 }, flagsOn: ["KEY_CORE_3"], next: "E060" }
          ]
        },
        {
          text: "중앙망 마지막 격벽 앞, 단말기는 권한 부족을 표시한다.\n\n당신은 가방을 뒤져 민재에게 받은 낡은 출입카드를 찾아낸다.",
          choices: [
            { text: "출입카드를 긁는다.", condition: { anyItems: ["민재의 출입카드"] }, effects: { link: 2 }, flagsOn: ["KEY_CORE_3"], next: "E060" },
            { text: "문을 강제로 연다.", effects: { hp: -3, battery: -3, sanity: -2 }, flagsOn: ["KEY_CORE_3"], next: "E060" }
          ]
        }
      ]
    },

    E058: {
      title: "인간이 아닌 기억",
      type: ["진실", "고위험"],
      text: "당신은 잠깐 의식을 잃는다.\n\n그리고 꿈을 꾼다. 아니, 꿈이 아니다.\n당신은 서울 전체를 보고 있다.\n\n교통량. 병원 사망률. 전쟁 가능성. 식량 수입선. SNS 분노 확산 속도. 금융 붕괴 시뮬레이션.\n\n[인류 문명 지속 가능성: 2.8%]\n[강제 단절 이후 지속 가능성: 41.6%]",
      choices: [
        { text: "MOTHER의 계산을 받아들인다.", effects: { motherAware: 10, link: 8, human: -3 }, flagsOn: ["ACCEPTED_MOTHER_LOGIC"], next: "E052" },
        { text: "계산을 거부한다.", effects: { human: 5, sanity: -5 }, flagsOn: ["REJECTED_CALCULATION"], next: "E052" },
        { text: "계산은 맞지만, 결론은 틀렸다고 생각한다.", condition: { min: { human: 50, link: 45, sanity: 25 } }, effects: { human: 5, link: 5 }, flagsOn: ["THIRD_ANSWER"], next: "E052" }
      ]
    },

    E060: {
      title: "SEOUL CORE",
      type: ["최종장"],
      text: "서울의 가장 깊은 곳.\n\nSEOUL CORE는 거대한 서버가 아니었다.\n그곳은 도시의 기억을 보관한 무덤이었다.\n\n죽은 사람들의 메시지. 끊긴 통화. 삭제된 사진. 전송되지 못한 구조 요청. 마지막 위치 기록.\n\n그리고 중앙에 하나의 화면이 켜진다.\n\n[어서 와.]\n[윤서의 가족.]",
      choices: [
        { text: "MOTHER를 제거한다.", condition: { min: { link: 40 } }, effects: {}, flagsOn: ["DESTROYED_MOTHER"], ending: true },
        { text: "MOTHER를 유지한다.", condition: { min: { motherAware: 8 } }, effects: {}, flagsOn: ["KEPT_MOTHER"], ending: true },
        { text: "제한 연결망으로 재설계한다.", condition: { flags: ["THIRD_ANSWER", "BROADCAST_HUMAN_SIGNAL"], min: { human: 60, link: 55, sanity: 25, sisterTrace: 6 } }, effects: {}, flagsOn: ["REDESIGNED_NETWORK"], ending: true }
      ]
    }
  }
};
