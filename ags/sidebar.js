const message = Widget.Label({
	label: 'Good morning,\nRemy!',
	className: 'message',
	useMarkup: true,
	setup: self => self.poll(1000, self => {
		const hour = new Date().getHours()
		let time = '';
		if (hour < 5 || hour > 21) time = 'night'
		else if (hour < 12) time = 'morning'
		else if (hour < 17) time = 'afternoon'
		else time = 'evening'
		self.label = `Good ${time},\n<span color="#89B482">Remy!</span>`
	})
})

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const titlebar = Widget.Label({
	hexpand: true,
	className: 'titlebar',
	label: `${new Date().toLocaleDateString('en-us', { month: 'long' })} ${new Date().getFullYear()}`,
	setup: self => self.poll(1000, self => {
		self.label = `${new Date().toLocaleDateString('en-us', { month: 'long' })} ${new Date().getFullYear()}`
	})
})

const days = Widget.Box({
	vertical: true,
	children: [],
	spacing: 6,
	setup: self => self.poll(1000, self => {
		const date = new Date()
		const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
		const paddingDays = firstDayOfMonth.getDay() - 1
		const monthLength = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

		const days = []
		for (let i = 0; i <= monthLength + paddingDays; i++) {
			days.push(Widget.Label({
				label: `${i - paddingDays}`,
				className: `day ${date.getDate() == i - paddingDays ? 'current' : (i <= paddingDays ? 'padding' : '')}`,
			}))
		}

		const chunkedArray = []
		for (let i = 0; i < days.length; i += 7) {
			chunkedArray.push(Widget.Box({ children: days.slice(i, i + 7) }))
		}

		self.children = [Widget.Box({ children: daysOfWeek.map(d => Widget.Label({ className: 'day-of-week', label: d, hexpand: true })) }), ...chunkedArray]
	})
})

const calendar = Widget.Box({
	vertical: true,
	spacing: 24,
	children: [
		titlebar,
		days
	]
})
32
const todoList = Variable([])
todoList.value = JSON.parse(Utils.readFile('~/.local/share/todos.json') || '[]')
todoList.connect('changed', ({ value }) => {
	Utils.writeFile(JSON.stringify(value), '~/.local/share/todos.json')
})

const todoEntry = Widget.Entry({
	hexpand: true,
	onAccept: addTodo,
	placeholderText: 'Todo Name',
	className: 'todo-entry',
})

function addTodo() {
	todoList.value = [...todoList.value, { name: todoEntry.text, done: false }]
	todoEntry.text = ''
}

const todoBar = Widget.Box({
	spacing: 16,
	children: [
		todoEntry,
		Widget.Button({
			label: 'Add Todo',
			className: 'todo-button',
			onClicked: addTodo
		})
	]
})

const todoItems = Widget.Box({
	vertical: true,
	spacing: 16,
	children: todoList.bind().as(list => list.map(todo => Widget.Box({
		spacing: 8,
		children: [
			Widget.Entry({
				hexpand: true,
				text: todo.name,
				className: 'todo-entry',
				onAccept: ({ text }) => {
					todo.name = text
					todoList.setValue(todoList.value)
				}
			}),
			Widget.Button({
				child: Widget.Icon(todo.done ? 'checkbox-checked-symbolic' : 'checkbox-symbolic'),
				className: `todo-button ${todo.done ? 'checked' : ''}`,
				onClicked: () => {
					todo.done = !todo.done
					todoList.setValue(todoList.value)
				}
			}),
			Widget.Button({
				child: Widget.Icon('user-trash-symbolic'),
				className: 'todo-button trash',
				onClicked: () => {
					todoList.value = todoList.value.filter(t => t != todo)
				}
			})
		]
	})))
})

const todos = Widget.Box({
	vertical: true,
	vexpand: true,
	spacing: 24,
	className: 'todos',
	children: [
		todoBar,
		todoItems
	]
})

const notes = Widget.Button({
	label: '',
	className: 'notes',
	tooltipText: 'Create a new note',
	onClicked: () => {
		Utils.execAsync(`alacritty --command nvim "~/Documents/notes/Quick Note - ${new Date().toString()}.md"`)
		hideSidebar()
	}
})

const sidebar = Widget.Box({
	vertical: true,
	className: 'sidebar',
	children: [
		message,
		calendar,
		todos,
		notes
	]
})

const sidebarWindow = Widget.Window({
	name: 'sidebar',
	visible: false,
	keymode: 'exclusive',
	css: 'background: none',
	setup: self => self.keybind('Escape', () => {
		hideSidebar()
	}),
	anchor: ['top', 'bottom', 'right'],
	margins: [16, 16, 16, 0],
	child: sidebar
})

function hideSidebar() {
	sidebarWindow.visible = false
}

export default sidebarWindow
