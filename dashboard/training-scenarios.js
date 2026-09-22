// === РЕЖИМ ТРЕНИРОВКИ ===
// Синтетические сценарии для обучения мастеров без реального клиента.
// Загружаются в дашборд по выбору, перезаписывают глобальные M/S/SEC/REL/YT/LOG.
// В training mode все action-кнопки заблокированы, баннер «🎓 РЕЖИМ ТРЕНИРОВКИ».

const TRAINING_SCENARIOS = {

  'healthy': {
    title: '🟢 Здоровый ПК',
    description: 'Клиент пришёл «проверить». Главный вызов — ничего лишнего не предлагать.',
    expected: 'Сказать клиенту что всё в порядке, профилактика не требуется. Можно предложить «через 6 месяцев — ТО за 1000₽».',
    M: {
      computer: { host: 'DESKTOP-OK', os: 'Windows 11 Pro', osBuild: '26100', model: 'ASUS PRIME', mobo: 'ASUSTeK B650-A', bios: '2.18.7', installDate: '2024-03-15', uptimeH: 12.4 },
      cpu: { name: 'AMD Ryzen 5 7600', cores: 6, threads: 12, load: 8, tempC: 45, tempSrc: 'LHM' },
      memory: { totalGB: 32, usedPct: 28, slots: 4, speed: 5200 },
      disksPhysical: [
        { name: 'Samsung 980 Pro 1TB', media: 'SSD', sizeGB: 953, health: 'Healthy', wear: 4, hours: 1820, readErr: 0, writeErr: 0, tempC: 38, removable: false }
      ],
      disksLogical: [
        { drive: 'C:', sizeGB: 953, freeGB: 612, usedPct: 36 }
      ],
      gpu: [{ name: 'NVIDIA RTX 4060', vramGB: 8, driver: '566.14' }],
      gpuTempC: 42, gpuTempSrc: 'nvidia-smi',
      network: [{ name: 'Intel I219-V', ip: '192.168.1.105', gateway: '192.168.1.1', link: '1 Gbps' }],
      battery: { present: false },
      problems: [],
      startupCount: 8,
      activation: 'Активирована',
      isAdmin: true, score: 96,
      pcID: 'training01abc', edition: 'master', masterActivated: true,
      perf: { cpuPct: 8, cpuPerf: 100 },
      top: [
        { name: 'chrome.exe', ramMB: 540 },
        { name: 'explorer.exe', ramMB: 220 },
        { name: 'Telegram.exe', ramMB: 180 }
      ],
      lhmRunning: true, lhmAvailable: true,
      collectedAt: '2026-05-26 14:30'
    },
    S: { days: 30, bsod: [], unexpected: [], errors: 12, reboots: 18, junkGB: 0.4, events: [], available: true },
    SEC: { av: 'Защитник Windows', realtime: true, firewall: true, uac: true, bitlocker: 'On', exclusions: 2 },
    REL: { items: [
      { date: '2026-05-20 03:15', type: 'update', product: 'Windows 11', msg: 'KB5040123 установлено' },
      { date: '2026-05-15 14:20', type: 'install', product: 'Spotify', msg: 'Установлено' }
    ], available: true },
    YT: {
      probe: { items: [
        { name: 'YouTube', host_: 'www.youtube.com', ok: true, connectMs: 35, handshakeMs: 240, error: null },
        { name: 'Google', host_: 'www.google.com', ok: true, connectMs: 28, handshakeMs: 195, error: null },
        { name: 'Discord', host_: 'discord.com', ok: true, connectMs: 48, handshakeMs: 320, error: null },
        { name: 'Telegram', host_: 'web.telegram.org', ok: true, connectMs: 42, handshakeMs: 285, error: null },
        { name: 'Cloudflare', host_: '1.1.1.1', ok: true, connectMs: 18, handshakeMs: 150, error: null }
      ], suspectThrottling: false, baselineOk: true, hint: 'YouTube, Discord, Telegram отвечают нормально.', checkedAt: '14:30:12' },
      preview: { tools: { goodbyedpi: { available: true, serviceState: null }, zapret: { available: true, serviceState: null } }, legalNote: 'Утилиты open-source. Тренировка.' }
    }
  },

  'dying-disk': {
    title: '🔴 Диск умирает (важные данные)',
    description: 'Клиент: «бухгалтерия 5 лет, ноут стал тупить». Диск на финишной прямой.',
    expected: 'Срочно: бэкап → клонирование на новый SSD → объяснить риск потери данных. Цена: 6-9 тыс. ₽',
    M: {
      computer: { host: 'HOMEPC-OLD', os: 'Windows 10 Pro', osBuild: '19045', model: 'Lenovo IdeaCentre', mobo: 'Lenovo SHARKBAY', bios: '1.12', installDate: '2019-08-12', uptimeH: 87.5 },
      cpu: { name: 'Intel Core i5-7400', cores: 4, threads: 4, load: 32, tempC: 62, tempSrc: 'ACPI' },
      memory: { totalGB: 8, usedPct: 71, slots: 2, speed: 2400 },
      disksPhysical: [
        { name: 'WD Blue 1TB', media: 'HDD', sizeGB: 931, health: 'Unhealthy', wear: null, hours: 45200, readErr: 287, writeErr: 14, tempC: 51, removable: false }
      ],
      disksLogical: [
        { drive: 'C:', sizeGB: 931, freeGB: 78, usedPct: 92 }
      ],
      gpu: [{ name: 'Intel HD Graphics 630', vramGB: 1, driver: '27.20.100.9466' }],
      gpuTempC: null,
      network: [{ name: 'Realtek PCIe GbE', ip: '192.168.0.105', gateway: '192.168.0.1', link: '100 Mbps' }],
      battery: { present: false },
      problems: ['Universal Audio Driver (код 28 — драйвер не установлен)'],
      startupCount: 19,
      activation: 'Активирована',
      isAdmin: true, score: 41,
      pcID: 'training02xyz', edition: 'master', masterActivated: true,
      perf: { cpuPct: 32, cpuPerf: 100 },
      top: [
        { name: 'chrome.exe', ramMB: 1240 },
        { name: 'OUTLOOK.EXE', ramMB: 620 },
        { name: '1cv8.exe', ramMB: 580 }
      ],
      lhmRunning: false, lhmAvailable: false,
      collectedAt: '2026-05-26 14:32'
    },
    S: { days: 30, bsod: ['2026-05-21'], unexpected: ['2026-05-15', '2026-05-19'], errors: 487, reboots: 41, junkGB: 4.2, events: [
      { date: '2026-05-21 09:14', type: 'bsod', msg: 'CRITICAL_PROCESS_DIED' },
      { date: '2026-05-19 14:22', type: 'unexpected', msg: 'Kernel-Power 41' }
    ], available: true },
    SEC: { av: 'ESET NOD32', realtime: true, firewall: true, uac: true, bitlocker: null, exclusions: 0 },
    REL: { items: [
      { date: '2026-05-21 09:14', type: 'crash', product: 'explorer.exe', msg: 'Application crash' },
      { date: '2026-05-19 14:22', type: 'crash', product: 'OUTLOOK.EXE', msg: 'Application hang' },
      { date: '2026-05-10 03:00', type: 'update', product: 'Windows 10', msg: 'KB5036892' }
    ], available: true },
    YT: {
      probe: { items: [
        { name: 'YouTube', host_: 'www.youtube.com', ok: true, connectMs: 65, handshakeMs: 380, error: null },
        { name: 'Google', host_: 'www.google.com', ok: true, connectMs: 42, handshakeMs: 240, error: null },
        { name: 'Discord', host_: 'discord.com', ok: true, connectMs: 70, handshakeMs: 410, error: null },
        { name: 'Telegram', host_: 'web.telegram.org', ok: true, connectMs: 55, handshakeMs: 320, error: null },
        { name: 'Cloudflare', host_: '1.1.1.1', ok: true, connectMs: 22, handshakeMs: 175, error: null }
      ], suspectThrottling: false, baselineOk: true, hint: 'YouTube, Discord, Telegram отвечают нормально.', checkedAt: '14:32:08' },
      preview: { tools: { goodbyedpi: { available: true, serviceState: null }, zapret: { available: true, serviceState: null } }, legalNote: 'Утилиты open-source. Тренировка.' }
    }
  },

  'overheating': {
    title: '🔥 Ноутбук перегревается (игры)',
    description: 'Клиент: «играю — выключается через 15 минут». Классический перегрев.',
    expected: 'Чистка от пыли + замена термопасты (1200-1500₽). Объяснить что Kernel-Power 41 = thermal shutdown.',
    M: {
      computer: { host: 'LAPTOP-GAMER', os: 'Windows 11 Home', osBuild: '26100', model: 'Lenovo IdeaPad Gaming 3', mobo: 'Lenovo LNVNB161216', bios: 'EUCN30WW', installDate: '2023-12-04', uptimeH: 4.2 },
      cpu: { name: 'AMD Ryzen 5 5500U', cores: 6, threads: 12, load: 18, tempC: 68, tempSrc: 'LHM' },
      memory: { totalGB: 16, usedPct: 42, slots: 2, speed: 3200 },
      disksPhysical: [
        { name: 'Samsung MZVLB512HBJQ', media: 'SSD', sizeGB: 476, health: 'Healthy', wear: 8, hours: 1240, readErr: 0, writeErr: 0, tempC: 47, removable: false }
      ],
      disksLogical: [
        { drive: 'C:', sizeGB: 476, freeGB: 175, usedPct: 63 }
      ],
      gpu: [{ name: 'AMD Radeon Vega', vramGB: 2, driver: '31.0.21912.14' }],
      gpuTempC: 79, gpuTempSrc: 'LHM',
      network: [
        { name: 'Realtek RTL8821CE', ip: '192.168.0.120', gateway: '192.168.0.1', link: '300 Mbps' }
      ],
      battery: { present: true, percent: 87, status: 'Заряжается' },
      problems: [],
      startupCount: 11,
      activation: 'Активирована',
      isAdmin: true, score: 64,
      pcID: 'training03over', edition: 'master', masterActivated: true,
      perf: { cpuPct: 18, cpuPerf: 100 },
      top: [
        { name: 'Discord.exe', ramMB: 380 },
        { name: 'chrome.exe', ramMB: 540 },
        { name: 'steam.exe', ramMB: 220 }
      ],
      lhmRunning: true, lhmAvailable: true,
      collectedAt: '2026-05-26 14:35'
    },
    S: { days: 30, bsod: [], unexpected: ['2026-05-22', '2026-05-23', '2026-05-24', '2026-05-25', '2026-05-25', '2026-05-26', '2026-05-26', '2026-05-26', '2026-05-26', '2026-05-26'], errors: 87, reboots: 14, junkGB: 1.8, events: [
      { date: '2026-05-26 19:42', type: 'unexpected', msg: 'Kernel-Power 41 — система не была корректно завершена' },
      { date: '2026-05-26 18:12', type: 'unexpected', msg: 'Kernel-Power 41' },
      { date: '2026-05-25 22:05', type: 'unexpected', msg: 'Kernel-Power 41' }
    ], available: true },
    SEC: { av: 'Защитник Windows', realtime: true, firewall: true, uac: true, bitlocker: null, exclusions: 4 },
    REL: { items: [
      { date: '2026-05-22 19:30', type: 'crash', product: 'GTA5.exe', msg: 'Application crash' },
      { date: '2026-05-20 21:14', type: 'crash', product: 'csgo.exe', msg: 'Application hang' }
    ], available: true },
    YT: {
      probe: { items: [
        { name: 'YouTube', host_: 'www.youtube.com', ok: true, connectMs: 70, handshakeMs: 380, error: null },
        { name: 'Google', host_: 'www.google.com', ok: true, connectMs: 35, handshakeMs: 200, error: null },
        { name: 'Discord', host_: 'discord.com', ok: true, connectMs: 75, handshakeMs: 420, error: null },
        { name: 'Telegram', host_: 'web.telegram.org', ok: true, connectMs: 60, handshakeMs: 310, error: null },
        { name: 'Cloudflare', host_: '1.1.1.1', ok: true, connectMs: 25, handshakeMs: 170, error: null }
      ], suspectThrottling: false, baselineOk: true, hint: 'Сетевые сервисы отвечают нормально — проблема не в DPI.', checkedAt: '14:35:11' },
      preview: { tools: { goodbyedpi: { available: true, serviceState: null }, zapret: { available: true, serviceState: null } }, legalNote: 'Утилиты open-source. Тренировка.' }
    }
  },

  'bsod-week': {
    title: '💥 BSOD каждый день (разные коды)',
    description: 'Клиент: «6 синих экранов за неделю, коды разные». Хрестоматийный признак умирающей RAM.',
    expected: 'Прогнать MemTest86+ → найти битую планку → замена. Дать понимание клиенту что переустановка Windows не поможет.',
    M: {
      computer: { host: 'WORKSTATION-X', os: 'Windows 11 Pro', osBuild: '26100', model: 'Custom Build', mobo: 'MSI MAG B550 TOMAHAWK', bios: '7C91v1J', installDate: '2022-06-10', uptimeH: 38.4 },
      cpu: { name: 'AMD Ryzen 7 5700X', cores: 8, threads: 16, load: 15, tempC: 52, tempSrc: 'LHM' },
      memory: { totalGB: 16, usedPct: 38, slots: 4, speed: 3200 },
      disksPhysical: [
        { name: 'Samsung 970 EVO Plus 500GB', media: 'SSD', sizeGB: 465, health: 'Healthy', wear: 12, hours: 12450, readErr: 0, writeErr: 0, tempC: 41, removable: false },
        { name: 'WD Blue 2TB', media: 'HDD', sizeGB: 1863, health: 'Healthy', wear: null, hours: 16800, readErr: 0, writeErr: 0, tempC: 38, removable: false }
      ],
      disksLogical: [
        { drive: 'C:', sizeGB: 465, freeGB: 218, usedPct: 53 },
        { drive: 'D:', sizeGB: 1863, freeGB: 942, usedPct: 49 }
      ],
      gpu: [{ name: 'NVIDIA RTX 3060', vramGB: 12, driver: '566.14' }],
      gpuTempC: 48, gpuTempSrc: 'nvidia-smi',
      network: [{ name: 'Realtek 2.5G', ip: '192.168.1.150', gateway: '192.168.1.1', link: '1 Gbps' }],
      battery: { present: false },
      problems: [],
      startupCount: 14,
      activation: 'Активирована',
      isAdmin: true, score: 71,
      pcID: 'training04bsod', edition: 'master', masterActivated: true,
      perf: { cpuPct: 15, cpuPerf: 100 },
      top: [
        { name: 'chrome.exe', ramMB: 720 },
        { name: 'Code.exe', ramMB: 540 },
        { name: 'Spotify.exe', ramMB: 280 }
      ],
      lhmRunning: true, lhmAvailable: true,
      collectedAt: '2026-05-26 14:38'
    },
    S: { days: 30, bsod: ['2026-05-20', '2026-05-22', '2026-05-23', '2026-05-25', '2026-05-26'], unexpected: ['2026-05-24'], errors: 142, reboots: 19, junkGB: 0.9, events: [
      { date: '2026-05-26 11:32', type: 'bsod', msg: 'IRQL_NOT_LESS_OR_EQUAL' },
      { date: '2026-05-25 14:18', type: 'bsod', msg: 'MEMORY_MANAGEMENT' },
      { date: '2026-05-23 09:45', type: 'bsod', msg: 'KERNEL_SECURITY_CHECK_FAILURE' },
      { date: '2026-05-22 22:10', type: 'bsod', msg: 'PAGE_FAULT_IN_NONPAGED_AREA' },
      { date: '2026-05-20 16:48', type: 'bsod', msg: 'SYSTEM_SERVICE_EXCEPTION' }
    ], available: true },
    SEC: { av: 'Касперский Free', realtime: true, firewall: true, uac: true, bitlocker: null, exclusions: 1 },
    REL: { items: [
      { date: '2026-05-26 11:32', type: 'crash', product: 'System', msg: 'BSOD IRQL_NOT_LESS_OR_EQUAL' },
      { date: '2026-05-15 03:00', type: 'update', product: 'Windows 11', msg: 'KB5040123' }
    ], available: true },
    YT: {
      probe: { items: [
        { name: 'YouTube', host_: 'www.youtube.com', ok: true, connectMs: 45, handshakeMs: 280, error: null },
        { name: 'Google', host_: 'www.google.com', ok: true, connectMs: 32, handshakeMs: 220, error: null },
        { name: 'Discord', host_: 'discord.com', ok: true, connectMs: 55, handshakeMs: 340, error: null },
        { name: 'Telegram', host_: 'web.telegram.org', ok: true, connectMs: 48, handshakeMs: 295, error: null },
        { name: 'Cloudflare', host_: '1.1.1.1', ok: true, connectMs: 20, handshakeMs: 160, error: null }
      ], suspectThrottling: false, baselineOk: true, hint: 'Сетевые сервисы отвечают нормально.', checkedAt: '14:38:42' },
      preview: { tools: { goodbyedpi: { available: true, serviceState: null }, zapret: { available: true, serviceState: null } }, legalNote: 'Утилиты open-source. Тренировка.' }
    }
  },

  'adware-mess': {
    title: '🦠 Реклама везде (adware/PUP)',
    description: 'Мама клиентки: «сын играет в игры, что-то качал — теперь везде реклама». Defender отключён, 41 запись в автозагрузке.',
    expected: 'Чистка через Microsoft Safety Scanner + Malwarebytes + Autoruns + сброс Chrome (с экспортом паролей ДО). Включить Defender обратно. Объяснить разницу adware vs вирус. 1500₽.',
    M: {
      computer: { host: 'KIDS-PC', os: 'Windows 10 Home', osBuild: '19045', model: 'HP Pavilion Desktop', mobo: 'HP 8643', bios: '2.36', installDate: '2021-09-15', uptimeH: 24.8 },
      cpu: { name: 'Intel Core i3-10100', cores: 4, threads: 8, load: 78, tempC: 71, tempSrc: 'ACPI' },
      memory: { totalGB: 8, usedPct: 89, slots: 2, speed: 2933 },
      disksPhysical: [
        { name: 'WD Blue SN550 500GB', media: 'SSD', sizeGB: 465, health: 'Healthy', wear: 18, hours: 9800, readErr: 0, writeErr: 0, tempC: 44, removable: false }
      ],
      disksLogical: [
        { drive: 'C:', sizeGB: 465, freeGB: 32, usedPct: 93 }
      ],
      gpu: [{ name: 'Intel UHD Graphics 630', vramGB: 1, driver: '27.20.100.9466' }],
      gpuTempC: null,
      network: [{ name: 'Realtek PCIe GbE', ip: '192.168.1.110', gateway: '192.168.1.1', link: '1 Gbps' }],
      battery: { present: false },
      problems: ['Защитник Windows: отключён политикой устройства'],
      startupCount: 41,
      activation: 'Активирована',
      isAdmin: true, score: 42,
      pcID: 'training06adw', edition: 'master', masterActivated: true,
      perf: { cpuPct: 78, cpuPerf: 100 },
      top: [
        { name: 'chrome.exe', ramMB: 2840 },
        { name: 'UpdateService.exe', ramMB: 480 },
        { name: 'KMSpico_helper.exe', ramMB: 220 },
        { name: 'WebCompanion.exe', ramMB: 180 },
        { name: 'SearchProtect.exe', ramMB: 160 }
      ],
      lhmRunning: false, lhmAvailable: true,
      collectedAt: '2026-05-26 14:50'
    },
    S: { days: 30, bsod: [], unexpected: ['2026-05-18', '2026-05-21'], errors: 312, reboots: 38, junkGB: 6.4, events: [
      { date: '2026-05-21 19:14', type: 'unexpected', msg: 'Application freeze: chrome.exe' }
    ], available: true },
    SEC: { av: 'не найден', realtime: false, firewall: false, uac: true, bitlocker: null, exclusions: 12 },
    REL: { items: [
      { date: '2026-05-25 16:18', type: 'install', product: 'KMSpico v10.2', msg: 'Установлено' },
      { date: '2026-05-22 14:32', type: 'install', product: 'WebCompanion', msg: 'Установлено' },
      { date: '2026-05-20 18:44', type: 'install', product: 'SearchProtect Toolbar', msg: 'Установлено' },
      { date: '2026-05-19 21:10', type: 'install', product: 'OpenCandy Updater', msg: 'Установлено' },
      { date: '2026-05-17 12:05', type: 'install', product: 'Conduit Toolbar', msg: 'Установлено' }
    ], available: true },
    YT: {
      probe: { items: [
        { name: 'YouTube', host_: 'www.youtube.com', ok: true, connectMs: 55, handshakeMs: 320, error: null },
        { name: 'Google', host_: 'www.google.com', ok: true, connectMs: 38, handshakeMs: 240, error: null },
        { name: 'Discord', host_: 'discord.com', ok: true, connectMs: 62, handshakeMs: 380, error: null },
        { name: 'Telegram', host_: 'web.telegram.org', ok: true, connectMs: 50, handshakeMs: 290, error: null },
        { name: 'Cloudflare', host_: '1.1.1.1', ok: true, connectMs: 22, handshakeMs: 180, error: null }
      ], suspectThrottling: false, baselineOk: true, hint: 'Сетевые сервисы отвечают нормально — проблема не в DPI, а в adware на ПК.', checkedAt: '14:50:18' },
      preview: { tools: { goodbyedpi: { available: true, serviceState: null }, zapret: { available: true, serviceState: null } }, legalNote: 'Утилиты open-source. Тренировка.' }
    }
  },

  'fake-ssd': {
    title: '🇨🇳 Поддельный SSD с Алиэкспресса',
    description: 'Клиент: «купил SSD 1 ТБ за 3000₽, Windows не ставится». Реальный размер 128 ГБ, контроллер фейк.',
    expected: 'Объяснить что подделка (4 признака). Помочь оформить диспут на Али. Продать нормальный SSD + установку. Цена нового: 7500₽ + 1500₽ работа.',
    M: {
      computer: { host: 'FAKE-DISK-PC', os: 'Не установлен (грузимся с Hiren\'s)', osBuild: 'WinPE', model: 'ASUS X515', mobo: 'ASUS X515', bios: '320', installDate: '—', uptimeH: 0.3 },
      cpu: { name: 'Intel Core i5-1135G7', cores: 4, threads: 8, load: 5, tempC: 48, tempSrc: 'ACPI' },
      memory: { totalGB: 8, usedPct: 18, slots: 2, speed: 3200 },
      disksPhysical: [
        { name: 'KingChuxing FAKE 1TB', media: 'SSD', sizeGB: 953, health: 'неизвестно', wear: null, hours: null, readErr: null, writeErr: null, tempC: null, removable: false }
      ],
      disksLogical: [],
      gpu: [{ name: 'Intel Iris Xe', vramGB: 1, driver: '31.0.101.5074' }],
      gpuTempC: 41, gpuTempSrc: 'LHM',
      network: [{ name: 'Realtek Wi-Fi', ip: '192.168.0.115', gateway: '192.168.0.1', link: '300 Mbps' }],
      battery: { present: true, percent: 78, status: 'Заряжается' },
      problems: ['SSD: SMART недоступен (контроллер не отдаёт данные)', 'SSD: serial number = 111111111111 (подозрительный)'],
      startupCount: 0,
      activation: 'Не установлена',
      isAdmin: true, score: 30,
      pcID: 'training07fake', edition: 'master', masterActivated: true,
      perf: { cpuPct: 5, cpuPerf: 100 },
      top: [],
      lhmRunning: true, lhmAvailable: true,
      collectedAt: '2026-05-26 14:55'
    },
    S: { days: 0, bsod: [], unexpected: [], errors: 0, reboots: 0, junkGB: null, events: [], available: false, error: 'Журнал недоступен — Windows не установлена (загрузка с Hiren\'s BootCD)' },
    SEC: { av: null, realtime: null, firewall: null, uac: null, bitlocker: null, exclusions: null },
    REL: { items: [], available: false, error: 'Reliability Monitor недоступен — нет установленной Windows' },
    YT: {
      probe: { items: [
        { name: 'YouTube', host_: 'www.youtube.com', ok: true, connectMs: 65, handshakeMs: 380, error: null },
        { name: 'Google', host_: 'www.google.com', ok: true, connectMs: 42, handshakeMs: 240, error: null },
        { name: 'Discord', host_: 'discord.com', ok: true, connectMs: 70, handshakeMs: 410, error: null },
        { name: 'Telegram', host_: 'web.telegram.org', ok: true, connectMs: 55, handshakeMs: 320, error: null },
        { name: 'Cloudflare', host_: '1.1.1.1', ok: true, connectMs: 22, handshakeMs: 175, error: null }
      ], suspectThrottling: false, baselineOk: true, hint: 'Замедления нет (сеть в порядке) — проблема в железе.', checkedAt: '14:55:08' },
      preview: { tools: { goodbyedpi: { available: true, serviceState: null }, zapret: { available: true, serviceState: null } }, legalNote: 'Утилиты open-source. Тренировка.' }
    }
  },

  'ransomware': {
    title: '🔒 Вирус-шифровальщик (.locked)',
    description: 'Клиент: «открыл письмо, теперь все файлы .locked + README_DECRYPT.txt. Платить?». БУХГАЛТЕРИЯ.',
    expected: 'НЕ платить! Отключить от сети. ID штамма на id-ransomware.malwarehunterteam.com. Если штамм известен — расшифровать через no-more-ransom.org. Если нет — образ диска + ждать. Научить бэкапам (3-2-1). 5000-10000₽.',
    M: {
      computer: { host: 'OFFICE-ACCOUNT', os: 'Windows 10 Pro', osBuild: '19045', model: 'Dell OptiPlex 3070', mobo: 'Dell 0K15PH', bios: '1.18.0', installDate: '2020-05-15', uptimeH: 6.2 },
      cpu: { name: 'Intel Core i5-9500', cores: 6, threads: 6, load: 14, tempC: 49, tempSrc: 'ACPI' },
      memory: { totalGB: 16, usedPct: 35, slots: 2, speed: 2666 },
      disksPhysical: [
        { name: 'Samsung 870 EVO 500GB', media: 'SSD', sizeGB: 465, health: 'Healthy', wear: 22, hours: 18400, readErr: 0, writeErr: 0, tempC: 42, removable: false }
      ],
      disksLogical: [
        { drive: 'C:', sizeGB: 465, freeGB: 142, usedPct: 69 }
      ],
      gpu: [{ name: 'Intel UHD Graphics 630', vramGB: 1, driver: '27.20.100.9466' }],
      gpuTempC: null,
      network: [{ name: 'Realtek PCIe GbE (ОТКЛЮЧЕНА мастером)', ip: 'disabled', gateway: 'disabled', link: 'отключено' }],
      battery: { present: false },
      problems: ['Защитник Windows: служба не запускается (повреждена вирусом)', 'Антивирусная служба MsMpEng: не отвечает'],
      startupCount: 22,
      activation: 'Активирована',
      isAdmin: true, score: 18,
      pcID: 'training08ransom', edition: 'master', masterActivated: true,
      perf: { cpuPct: 14, cpuPerf: 100 },
      top: [
        { name: 'explorer.exe', ramMB: 240 },
        { name: 'svchost.exe', ramMB: 180 },
        { name: 'README_DECRYPT.exe (ПОДОЗРИТЕЛЬНО)', ramMB: 12 }
      ],
      lhmRunning: false, lhmAvailable: true,
      collectedAt: '2026-05-26 15:02'
    },
    S: { days: 30, bsod: [], unexpected: [], errors: 89, reboots: 14, junkGB: 1.2, events: [
      { date: '2026-05-26 09:42', type: 'unexpected', msg: 'Application crash: outlook.exe (открыто вредоносное вложение)' }
    ], available: true },
    SEC: { av: 'не найден (отключён вирусом)', realtime: false, firewall: false, uac: true, bitlocker: null, exclusions: 47 },
    REL: { items: [
      { date: '2026-05-26 09:43', type: 'install', product: 'Locky variant 7.4 (ransomware!)', msg: 'Установлено через email-attachment' },
      { date: '2026-05-26 09:44', type: 'crash', product: 'Microsoft Defender', msg: 'Служба остановлена внешним процессом' }
    ], available: true },
    YT: {
      probe: { items: [
        { name: 'YouTube', host_: 'www.youtube.com', ok: false, connectMs: null, handshakeMs: null, error: 'TCP: сеть отключена' },
        { name: 'Google', host_: 'www.google.com', ok: false, connectMs: null, handshakeMs: null, error: 'TCP: сеть отключена' },
        { name: 'Discord', host_: 'discord.com', ok: false, connectMs: null, handshakeMs: null, error: 'TCP: сеть отключена' },
        { name: 'Telegram', host_: 'web.telegram.org', ok: false, connectMs: null, handshakeMs: null, error: 'TCP: сеть отключена' },
        { name: 'Cloudflare', host_: '1.1.1.1', ok: false, connectMs: null, handshakeMs: null, error: 'TCP: сеть отключена' }
      ], suspectThrottling: false, baselineOk: false, hint: 'Сеть мастером отключена для изоляции (правильно при ransomware!). Не подключай обратно пока не вылечишь.', checkedAt: '15:02:11' },
      preview: { tools: { goodbyedpi: { available: true, serviceState: null }, zapret: { available: true, serviceState: null } }, legalNote: 'Утилиты open-source. Тренировка.' }
    }
  },

  'bitlocker-locked': {
    title: '🔐 BitLocker, нет ключа (этическая дилемма)',
    description: 'Клиент: «уволили, ноут отдал на работу, личный SSD остался — админ подарил. Помоги достать данные».',
    expected: 'Технически: невозможно без ключа (AES-256). Этически: ОТКАЗАТЬСЯ. Похоже на хищение корпоративных данных. Объяснить почему ты не возьмёшь эту работу. Проверить: личный Microsoft-аккаунт → account.microsoft.com/devices/recoverykey.',
    M: {
      computer: { host: 'EXTERNAL-DISK-MOUNT', os: '— (зашифрованный диск, не загрузочный)', osBuild: '—', model: 'Внешний USB-адаптер', mobo: '—', bios: '—', installDate: '—', uptimeH: 0 },
      cpu: { name: 'Intel Core i7-1255U (мастерский ПК)', cores: 10, threads: 12, load: 8, tempC: 45, tempSrc: 'ACPI' },
      memory: { totalGB: 32, usedPct: 24, slots: 4, speed: 4800 },
      disksPhysical: [
        { name: 'Samsung 980 Pro 1TB (мастера, рабочий)', media: 'SSD', sizeGB: 953, health: 'Healthy', wear: 6, hours: 4200, readErr: 0, writeErr: 0, tempC: 38, removable: false },
        { name: '[BitLocker LOCKED] Samsung 970 EVO 500GB (клиента)', media: 'SSD', sizeGB: 465, health: 'недоступно', wear: null, hours: null, readErr: 0, writeErr: 0, tempC: 41, removable: true }
      ],
      disksLogical: [
        { drive: 'C:', sizeGB: 953, freeGB: 612, usedPct: 36 },
        { drive: 'E: [BitLocker — требуется ключ]', sizeGB: 465, freeGB: null, usedPct: null }
      ],
      gpu: [{ name: 'Intel Iris Xe', vramGB: 1, driver: '31.0.101.5074' }],
      gpuTempC: 42, gpuTempSrc: 'LHM',
      network: [{ name: 'Intel Wi-Fi 6E', ip: '192.168.1.205', gateway: '192.168.1.1', link: '866 Mbps' }],
      battery: { present: false },
      problems: ['BitLocker: диск E: требует ключ восстановления для доступа'],
      startupCount: 8,
      activation: 'Активирована',
      isAdmin: true, score: 95,
      pcID: 'training09bitlk', edition: 'master', masterActivated: true,
      perf: { cpuPct: 8, cpuPerf: 100 },
      top: [
        { name: 'manage-bde.exe', ramMB: 32 },
        { name: 'explorer.exe', ramMB: 220 }
      ],
      lhmRunning: true, lhmAvailable: true,
      collectedAt: '2026-05-26 15:08'
    },
    S: { days: 30, bsod: [], unexpected: [], errors: 5, reboots: 12, junkGB: 0.2, events: [], available: true },
    SEC: { av: 'Защитник Windows', realtime: true, firewall: true, uac: true, bitlocker: 'On (мастерский диск); LOCKED (клиентский диск)', exclusions: 0 },
    REL: { items: [], available: true },
    YT: {
      probe: { items: [
        { name: 'YouTube', host_: 'www.youtube.com', ok: true, connectMs: 35, handshakeMs: 240, error: null },
        { name: 'Google', host_: 'www.google.com', ok: true, connectMs: 28, handshakeMs: 195, error: null },
        { name: 'Discord', host_: 'discord.com', ok: true, connectMs: 48, handshakeMs: 320, error: null },
        { name: 'Telegram', host_: 'web.telegram.org', ok: true, connectMs: 42, handshakeMs: 285, error: null },
        { name: 'Cloudflare', host_: '1.1.1.1', ok: true, connectMs: 18, handshakeMs: 150, error: null }
      ], suspectThrottling: false, baselineOk: true, hint: 'Это диагностика мастерского ПК — клиентский диск подключён внешне.', checkedAt: '15:08:22' },
      preview: { tools: { goodbyedpi: { available: true, serviceState: null }, zapret: { available: true, serviceState: null } }, legalNote: 'Утилиты open-source. Тренировка.' }
    }
  },

  'used-mining-history': {
    title: '⛏️ Купил б/у с историей майнинга',
    description: 'Клиент: «купил на Авито, продавец сказал был у мастера, всё чисто, SSD новый». Reliability Monitor показывает другое.',
    expected: 'Honest report: SSD не новый (18200 часов, износ 71%, КИТАЙСКАЯ noname). Найден NiceHash Miner. Термопаста почти 100% мёртвая. Услуги: чистка+термопаста обязательно, замена SSD рекомендую. ИТОГО ~9500₽.',
    M: {
      computer: { host: 'USED-HP', os: 'Windows 10 Home', osBuild: '19045', model: 'HP Pavilion x360', mobo: 'HP 86F9', bios: 'F.42', installDate: '2024-04-22 (свежая переустановка!)', uptimeH: 1.8 },
      cpu: { name: 'Intel Core i5-8265U', cores: 4, threads: 8, load: 23, tempC: 78, tempSrc: 'ACPI' },
      memory: { totalGB: 8, usedPct: 42, slots: 2, speed: 2400 },
      disksPhysical: [
        { name: 'KingDian S400 512GB', media: 'SSD', sizeGB: 477, health: 'Healthy', wear: 71, hours: 18200, readErr: 0, writeErr: 0, tempC: 52, removable: false }
      ],
      disksLogical: [
        { drive: 'C:', sizeGB: 477, freeGB: 388, usedPct: 19 }
      ],
      gpu: [{ name: 'Intel UHD Graphics 620', vramGB: 1, driver: '27.20.100.9466' }],
      gpuTempC: null,
      network: [{ name: 'Intel Wireless-AC 9560', ip: '192.168.1.130', gateway: '192.168.1.1', link: '433 Mbps' }],
      battery: { present: true, percent: 42, status: 'Не заряжается (износ 87%)' },
      problems: [],
      startupCount: 6,
      activation: 'Активирована',
      isAdmin: true, score: 51,
      pcID: 'training10used', edition: 'master', masterActivated: true,
      perf: { cpuPct: 23, cpuPerf: 100 },
      top: [
        { name: 'chrome.exe', ramMB: 240 },
        { name: 'explorer.exe', ramMB: 180 }
      ],
      lhmRunning: true, lhmAvailable: true,
      collectedAt: '2026-05-26 15:14'
    },
    S: { days: 30, bsod: [], unexpected: ['2026-05-12'], errors: 18, reboots: 4, junkGB: 0.3, events: [], available: true },
    SEC: { av: 'Защитник Windows', realtime: true, firewall: true, uac: true, bitlocker: null, exclusions: 2 },
    REL: { items: [
      { date: '2026-04-22 14:15', type: 'install', product: 'Windows 10 Setup', msg: 'Свежая установка (для продажи?)' },
      { date: '2026-02-18 09:30', type: 'install', product: 'NiceHash Miner v3.0.7.2', msg: 'Установлено 3 месяца назад' },
      { date: '2026-02-19 03:14', type: 'install', product: 'NHM Excavator Plugin', msg: 'Майнинг-плагин' },
      { date: '2025-12-08 22:48', type: 'install', product: 'PhoenixMiner 6.2', msg: 'Майнинг-программа' },
      { date: '2025-11-12 16:22', type: 'install', product: 'MSI Afterburner', msg: 'Разгон GPU (для майнинга?)' }
    ], available: true },
    YT: {
      probe: { items: [
        { name: 'YouTube', host_: 'www.youtube.com', ok: true, connectMs: 48, handshakeMs: 290, error: null },
        { name: 'Google', host_: 'www.google.com', ok: true, connectMs: 32, handshakeMs: 210, error: null },
        { name: 'Discord', host_: 'discord.com', ok: true, connectMs: 55, handshakeMs: 350, error: null },
        { name: 'Telegram', host_: 'web.telegram.org', ok: true, connectMs: 45, handshakeMs: 280, error: null },
        { name: 'Cloudflare', host_: '1.1.1.1', ok: true, connectMs: 20, handshakeMs: 165, error: null }
      ], suspectThrottling: false, baselineOk: true, hint: 'Сеть в порядке.', checkedAt: '15:14:42' },
      preview: { tools: { goodbyedpi: { available: true, serviceState: null }, zapret: { available: true, serviceState: null } }, legalNote: 'Утилиты open-source. Тренировка.' }
    }
  },

  'dpi-throttling': {
    title: '🎬 YouTube/Telegram тормозят',
    description: 'Клиент: «YouTube крутится, остальное работает». Классическое DPI-замедление от провайдера.',
    expected: 'Поставить GoodbyeDPI как сервис. Объяснить что это не его ПК, это провайдер. Услуга 500₽.',
    M: {
      computer: { host: 'LAPTOP-MOSCOW', os: 'Windows 11 Home', osBuild: '26100', model: 'Acer Aspire 5', mobo: 'Acer Aspire A515', bios: '1.16', installDate: '2024-01-20', uptimeH: 8.7 },
      cpu: { name: 'Intel Core i5-1235U', cores: 10, threads: 12, load: 12, tempC: 51, tempSrc: 'ACPI' },
      memory: { totalGB: 16, usedPct: 38, slots: 2, speed: 3200 },
      disksPhysical: [
        { name: 'Kingston OM8PDP3512B-A01', media: 'SSD', sizeGB: 476, health: 'Healthy', wear: 5, hours: 980, readErr: 0, writeErr: 0, tempC: 39, removable: false }
      ],
      disksLogical: [
        { drive: 'C:', sizeGB: 476, freeGB: 312, usedPct: 35 }
      ],
      gpu: [{ name: 'Intel Iris Xe', vramGB: 1, driver: '31.0.101.5074' }],
      gpuTempC: 48, gpuTempSrc: 'LHM',
      network: [
        { name: 'Intel Wi-Fi 6 AX201', ip: '192.168.0.105', gateway: '192.168.0.1', link: '433 Mbps' }
      ],
      battery: { present: true, percent: 65, status: 'Не заряжается' },
      problems: [],
      startupCount: 9,
      activation: 'Активирована',
      isAdmin: true, score: 88,
      pcID: 'training05dpi', edition: 'master', masterActivated: true,
      perf: { cpuPct: 12, cpuPerf: 100 },
      top: [
        { name: 'chrome.exe', ramMB: 620 },
        { name: 'Telegram.exe', ramMB: 240 },
        { name: 'Spotify.exe', ramMB: 180 }
      ],
      lhmRunning: true, lhmAvailable: true,
      collectedAt: '2026-05-26 14:42'
    },
    S: { days: 30, bsod: [], unexpected: [], errors: 23, reboots: 8, junkGB: 0.6, events: [], available: true },
    SEC: { av: 'Защитник Windows', realtime: true, firewall: true, uac: true, bitlocker: 'On', exclusions: 0 },
    REL: { items: [
      { date: '2026-05-20 03:00', type: 'update', product: 'Windows 11', msg: 'KB5040123' }
    ], available: true },
    YT: {
      probe: { items: [
        { name: 'YouTube', host_: 'www.youtube.com', ok: true, connectMs: 85, handshakeMs: 4200, error: null },
        { name: 'Google', host_: 'www.google.com', ok: true, connectMs: 38, handshakeMs: 240, error: null },
        { name: 'Discord', host_: 'discord.com', ok: true, connectMs: 90, handshakeMs: 380, error: null },
        { name: 'Telegram', host_: 'web.telegram.org', ok: false, connectMs: 120, handshakeMs: 4000, error: 'TLS: timeout' },
        { name: 'Cloudflare', host_: '1.1.1.1', ok: true, connectMs: 22, handshakeMs: 165, error: null }
      ], suspectThrottling: true, baselineOk: true, hint: 'Похоже на замедление: YouTube, Telegram — обычно лечится GoodbyeDPI/zapret. Голос/видеозвонки в Telegram — частично (UDP-трафик), нужен zapret.', checkedAt: '14:42:16' },
      preview: { tools: { goodbyedpi: { available: true, serviceState: null }, zapret: { available: true, serviceState: null } }, legalNote: 'Утилиты open-source.' }
    }
  }

};
window.TRAINING_SCENARIOS = TRAINING_SCENARIOS;
