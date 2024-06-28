import brightness from './brightness.js'

const apps = [
	['godot', 'discord', 'thunderbird'],
	['resolve', 'steam', 'vlc'],
	['obs', 'ldtk', 'aseprite']
]
const appWidgets = apps.map(row => Widget.Box({
	children: row.map(app => Widget.Button({
		className: 'application',
		child: Widget.Icon({
			icon: app,
			size: 36,
		}),
		onClicked: () => {
			hideDashboard()
			let command = app
			if (app == 'resolve') command = '/opt/resolve/bin/resolve'
			if (app == 'aseprite') command = '/home/remy/Applications/Aseprite_1.3.7-x64.AppImage'
			Utils.execAsync(command)
		}
	}))
}))
const applications = Widget.Box({
	vertical: true,
	children: appWidgets,
	className: 'applications'
})

const dirs = ['Documents', 'Downloads', 'Pictures', 'Videos', 'Home', 'Config']
const dirColours = ['#EA6962', '#A9B665', '#E78A4E', '#89B482', '#D8A657', '#7DAEA3']
const directoryWidgets = dirs.map((dir, index) => Widget.Button({
	vexpand: true,
	label: dir,
	css: `color: ${dirColours[index]}`,
	className: 'directory',
	onClicked: () => {
		hideDashboard()
		let dirPath = dir
		if (dir == 'Home') dirPath = ''
		if (dir == 'Config') dirPath = '.config'
		Utils.execAsync(`thunar /home/remy/${dirPath}`)
	}
}))
const directories = Widget.Box({
	className: 'directories',
	spacing: 8,
	vertical: true,
	vexpand: true,
	children: directoryWidgets
})

const time = Widget.Box({
	className: 'time-date',
	vertical: true,
	children: [
		Widget.Label({ className: 'time' }).poll(1000, self => {
			self.label = Utils.exec('date +"%-I:%M %p"')
		}),
		Widget.Label({ className: 'date' }).poll(1000, self => {
			self.label = Utils.exec('date +"%a %b %-d"')
		})
	]
})

let kernel, packages, uptime

kernel = Utils.exec('uname -r')
packages = Utils.exec('paru -Q').split('\n').length
uptime = Utils.exec('uptime -p').substring(3, Infinity)

const fetch = Widget.Box({
	className: 'fetch',
	vertical: true,
	vexpand: true,
	setup: self => self.poll(10000, self => {
		kernel = Utils.exec('uname -r')
		packages = Utils.exec('paru -Q').split('\n').length
		uptime = Utils.exec('uptime -p').substring(3, Infinity).replace('minutes', 'mins').replace('hours', 'hrs')
		self.children = [
			Widget.Label({
				vexpand: true,
				className: 'os',
				useMarkup: true,
				label: `<span color="#7DAEA3">󰣇</span> <b>OS:</b> Arch Linux`
			}),
			Widget.Label({
				vexpand: true,
				className: 'kernel',
				useMarkup: true,
				label: `<span color="#D8A657"></span> <b>Kernel:</b> ${kernel}`
			}),
			Widget.Label({
				vexpand: true,
				className: 'packages',
				useMarkup: true,
				label: `<span color="#A9B665">󰏓</span> <b>Packages:</b> ${packages}`
			}),
			Widget.Label({
				vexpand: true,
				className: 'uptime',
				useMarkup: true,
				label: `<span color="#EA6962"></span> <b>Uptime:</b> ${uptime}`
			})
		]
	})
})

let weatherJson = JSON.parse(await Utils.execAsync('curl "wttr.in/?format=j2"'))

const weatherCodes = {
	'113': '<span color="#D8A657"></span>',
	'116': '<span color="#D8A657"></span>',
	'119': '<span color="#7daea3"></span>',
	'122': '<span color="#7daea3"></span>',
	'143': '<span color="#A89984"></span>',
	'176': '<span color="#7daea3"></span>',
	'179': '<span color="#7daea3"></span>',
	'182': '<span color="#7daea3"></span>',
	'185': '<span color="#7daea3"></span>',
	'200': '<span color="#7daea3"></span>',
	'227': '<span color="#7daea3"></span>',
	'230': '<span color="#7daea3"></span>',
	'248': '<span color="#A89984"></span>',
	'260': '<span color="#A89984"></span>',
	'263': '<span color="#7daea3"></span>',
	'266': '<span color="#7daea3"></span>',
	'281': '<span color="#7daea3"></span>',
	'284': '<span color="#7daea3"></span>',
	'293': '<span color="#7daea3"></span>',
	'296': '<span color="#7daea3"></span>',
	'299': '<span color="#7daea3"></span>',
	'302': '<span color="#7daea3"></span>',
	'305': '<span color="#7daea3"></span>',
	'308': '<span color="#7daea3"></span>',
	'311': '<span color="#7daea3"></span>',
	'314': '<span color="#7daea3"></span>',
	'317': '<span color="#7daea3"></span>',
	'320': '<span color="#D4BE98"></span>',
	'323': '<span color="#D4BE98"></span>',
	'326': '<span color="#D4BE98"></span>',
	'329': '<span color="#7daea3"></span>',
	'332': '<span color="#7daea3"></span>',
	'335': '<span color="#7daea3"></span>',
	'338': '<span color="#7daea3"></span>',
	'350': '<span color="#7daea3"></span>',
	'353': '<span color="#7daea3"></span>',
	'356': '<span color="#7daea3"></span>',
	'359': '<span color="#7daea3"></span>',
	'362': '<span color="#7daea3"></span>',
	'365': '<span color="#7daea3"></span>',
	'368': '<span color="#D4BE98"></span>',
	'371': '<span color="#D4BE98"></span>',
	'374': '<span color="#7daea3"></span>',
	'377': '<span color="#7daea3"></span>',
	'386': '<span color="#7daea3"></span>',
	'389': '<span color="#7daea3"></span>',
	'392': '<span color="#7daea3"></span>',
	'395': '<span color="#7daea3"></span>',
}

async function updateWeather(weatherWidget) {
	weatherJson = JSON.parse(await Utils.execAsync('curl "wttr.in/?format=j1"'))

	const weatherIcon = Widget.Label({
		className: 'current-weather-icon',
		useMarkup: true,
		label: weatherCodes[weatherJson.current_condition[0].weatherCode]
	})
	const temperature = Widget.Label({
		className: 'current-weather-temp',
		label: `${weatherJson.current_condition[0].temp_C}°`
	})
	const weatherName = Widget.Label({
		className: 'current-weather-name',
		label: weatherJson.current_condition[0].weatherDesc[0].value
	})

	const currentWeather = Widget.Box({
		vertical: true,
		hpack: 'start',
		children: [
			Widget.Box({
				children: [
					weatherIcon,
					temperature
				]
			}),
			weatherName
		]
	})

	const forecastWidgets = weatherJson.weather.map((item, index) => {
		const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
		const day = days[(new Date().getDay() + index) % 7]
		const icon = weatherCodes[item.hourly[4].weatherCode]
		const desc = item.hourly[4].weatherDesc[0].value
		const maxTemp = `${item.maxtempC}°`

		return Widget.Box({
			vertical: true,
			children: [
				Widget.Label({
					className: 'forecast-day',
					label: day
				}),
				Widget.Box({
					spacing: 8,
					children: [
						Widget.Label({
							className: 'forecast-icon',
							useMarkup: true,
							label: icon
						}),
						Widget.Label({
							className: 'forecast-temp',
							label: maxTemp
						}),
						Widget.Label({
							className: 'forecast-desc',
							label: desc
						})
					]
				})
			]
		})
	})

	const forecast = Widget.Box({
		vertical: true,
		spacing: 16,
		children: forecastWidgets
	})

	weatherWidget.children = [currentWeather, forecast]
}

const weather = Widget.Box({
	vertical: true,
	spacing: 12,
	className: 'weather',
	setup: self => self.poll(10000, updateWeather)
})

updateWeather(weather)

const audio = await Service.import('audio')

const volumeSlider = Widget.Slider({
	hexpand: true,
	drawValue: false,
	onChange: ({ value }) => audio.speaker.volume = value,
	value: audio.speaker.bind('volume')
})

const volumeIndicator = Widget.Button({
	className: 'volume-indicator',
	onClicked: () => audio.speaker.is_muted = !audio.speaker.is_muted,
	child: Widget.Icon().hook(audio.speaker, self => {
		const vol = audio.speaker.volume * 100;
		const icon = [
			[101, 'overamplified'],
			[67, 'high'],
			[34, 'medium'],
			[1, 'low'],
			[0, 'muted'],
		].find(([threshold]) => threshold <= vol)?.[1];

		self.icon = `audio-volume-${audio.speaker.isMuted ? 'muted' : icon}-symbolic`;
		self.tooltip_text = `Volume ${Math.floor(vol)}%`;
	}),
})

const volumePercent = Widget.Label({
	className: 'volume-percent',
	label: audio.speaker.bind('volume').as(v => `${Math.floor(v * 100)}%`)
})

const volume = Widget.Box({
	children: [
		volumeIndicator,
		volumePercent,
		volumeSlider
	]
})

const backlightIndicator = Widget.Label({
	className: 'backlight-indicator',
	label: brightness.bind('screen-value').as(v => {
		if (v <= 0.25) return '󰃞'
		if (v <= 0.5) return '󰃟'
		if (v <= 0.75) return '󰃝'
		return '󰃠'
	})
})

const backlightPercent = Widget.Label({
	className: 'backlight-percent',
	label: brightness.bind('screen-value').as(b => `${Math.floor(b * 100)}%`)
})

const backlightSlider = Widget.Slider({
	hexpand: true,
	drawValue: false,
	onChange: self => brightness.screen_value = self.value,
	value: brightness.bind('screen-value'),
})

const backlight = Widget.Box({
	children: [
		backlightIndicator,
		backlightPercent,
		backlightSlider
	]
})

const sliders = Widget.Box({
	className: 'sliders',
	vertical: true,
	children: [
		volume,
		backlight
	]
})

const ramBar = Widget.LevelBar({
	hexpand: true,
	className: 'bar ram-bar',
	setup: self => self.poll(1000, self => {
		const numbers = Utils.exec('free').split('\n')[1].split(' ').filter(s => s != '')
		self.value = numbers[2] / numbers[1]
	})
})

const ram = Widget.Box({
	spacing: 12,
	children: [
		Widget.Icon({
			className: 'ram-icon',
			icon: 'ram-symbolic'
		}),
		ramBar
	]
})

const cpuBar = Widget.LevelBar({
	hexpand: true,
	className: 'bar cpu-bar',
	setup: self => self.poll(1000, self =>
		self.value = (100 - JSON.parse(Utils.exec('mpstat -o JSON')).sysstat.hosts[0].statistics[0]['cpu-load'][0].idle) / 100
	)
})

const cpu = Widget.Box({
	spacing: 12,
	children: [
		Widget.Icon({
			className: 'cpu-icon',
			icon: 'cpu-symbolic'
		}),
		cpuBar
	]
})

const battery = await Service.import('battery')

const bat = Widget.Box({
	spacing: 12,
	children: [
		Widget.Icon({
			className: 'bat_icon',
			icon: battery.bind('icon_name')
		}),
		Widget.LevelBar({
			className: 'bar bat-bar',
			hexpand: true,
			value: battery.bind('percent').as(p => p > 0 ? p / 100 : 0)
		})
	]
})

const network = await Service.import('network')

const wifi = Widget.Box({
	spacing: 12,
	children: [
		Widget.Icon({
			className: 'wifi-icon',
			icon: network.wifi.bind('icon_name')
		}),
		Widget.LevelBar({
			className: 'bar wifi-bar',
			hexpand: true,
			value: network.wifi.bind('strength').as(s => s / 100)
		})
	]
})

const info = Widget.Box({
	vertical: true,
	spacing: 32,
	className: 'info',
	children: [
		ram,
		cpu,
		bat,
		wifi
	]
})

const siteList = [
	[
		{
			icon: '<span color="#EA6962"></span>',
			url: 'https://www.youtube.com'
		},
		{
			icon: '<span color="#E78A4E"></span>',
			url: 'https://www.reddit.com'
		}
	],
	[
		{
			icon: '<span color="#D8A657"></span>',
			url: 'https://github.com'
		},
		{
			icon: '<span color="#A7B464">󰏆</span>',
			url: 'https://www.office.com'
		}
	],
	[
		{
			icon: '<span color="#89B482">󰣇</span>',
			url: 'https://archlinux.org'
		},
		{
			icon: '<span color="#7DAEA3"></span>',
			url: 'https://www.wikipedia.org'
		}
	]
]

const siteWidgets = siteList.map(row => Widget.Box({
	vertical: true,
	spacing: 16,
	children: row.map(site => Widget.Button({
		className: 'site',
		child: Widget.Label({
			label: site.icon,
			className: 'site-icon',
			useMarkup: true,
		}),
		hexpand: true,
		vexpand: true,
		onClicked: () => {
			Utils.execAsync(`librewolf ${site.url}`)
			hideDashboard()
		}
	}))
}))

const sites = Widget.Box({
	className: 'sites',
	children: [
		Widget.Box({
			spacing: 16,
			children: siteWidgets
		})
	]
})

const powerOptions = [
	{ icon: '', command: 'poweroff' },
	{ icon: '', command: 'reboot' },
	{ icon: '', command: 'systemctl suspend' },
	{ icon: '', command: 'killall Hyprland' }
]

const powerWidgets = powerOptions.map(option => Widget.Button({
	className: 'power-button',
	label: option.icon,
	onClicked: () => Utils.execAsync(option.command)
}))

const power = Widget.Box({
	spacing: 8,
	children: powerWidgets
})

const term = Widget.Button({
	label: '',
	vexpand: true,
	className: 'side-buttons',
	onClicked: () => {
		Utils.execAsync('alacritty')
		hideDashboard()
	}
})
const web = Widget.Button({
	label: '',
	vexpand: true,
	className: 'side-buttons',
	onClicked: () => {
		Utils.execAsync('librewolf')
		hideDashboard()
	}
})
const search = Widget.Button({
	label: '',
	vexpand: true,
	className: 'side-buttons',
	onClicked: () => {
		Utils.execAsync('wofi --show drun -a')
		hideDashboard()
	}
})


const columns = [
	[applications, directories],
	[time, fetch],
	[weather, sliders],
	[info, sites, power],
	[term, web, search]
]

const columnWidgets = columns.map(column => Widget.Box({
	vertical: true,
	vexpand: true,
	spacing: 16,
	children: column
}))

const dashboard = Widget.Box({
	hexpand: true,
	vexpand: true,
	spacing: 16,
	hpack: 'center',
	vpack: 'center',
	children: columnWidgets
})

const dashboardWindow = Widget.Window({
	name: 'dashboard',
	visible: false,
	keymode: 'exclusive',
	css: 'background: none',
	setup: self => self.keybind('Escape', () => {
		hideDashboard()
	}),
	anchor: ['top', 'left', 'bottom', 'right'],
	child: dashboard
})

function hideDashboard() {
	dashboardWindow.visible = false
}

export default dashboardWindow
