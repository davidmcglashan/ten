const shapes = {
	all: [
		{ // The 1x1 square one
			width: 1,
			height: 1,
			cells: [[0,0]],
			class: 'red'
		},

		{ // The 2x1 short rectangle
			width: 2,
			height: 1,
			cells: [[0,0],[1,0]],
			class: 'orange'
		},
		{ // The 1x2 short rectangle
			width: 1,
			height: 2,
			cells: [[0,0],[0,1]],
			class: 'orange'
		},

		{ // The 2x2 square one
			width: 2,
			height: 2,
			cells: [[0,0],[0,1],[1,0],[1,1]],
			class: 'yellow'
		},

		{ // 2x2 square with hole north-east
			width: 2,
			height: 2,
			cells: [[0,0],[0,1],[1,1]],
			class: 'green'
		},
		{ // 2x2 square with hole north-west
			width: 2,
			height: 2,
			cells: [[1,0],[0,1],[1,1]],
			class: 'green'
		},
		{ // 2x2 square with hole south-east
			width: 2,
			height: 2,
			cells: [[0,0],[0,1],[1,0]],
			class: 'green'
		},
		{ // 2x2 square with hole south-west
			width: 2,
			height: 2,
			cells: [[0,0],[1,0],[1,1]],
			class: 'green'
		},

		{ // The 3x1 rectangle
			width: 3,
			height: 1,
			cells: [[0,0],[1,0],[2,0]],
			class: 'blue'
		},
		{ // The 1x3 rectangle
			width: 1,
			height: 3,
			cells: [[0,0],[0,1],[0,2]],
			class: 'blue'
		},

		{ // The 3x3 L pointing north-east
			width: 3,
			height: 3,
			cells: [[0,0],[1,0],[2,0],[2,1],[2,2]],
			class: 'grey'
		},
		{ // The 3x3 L pointing north-west
			width: 3,
			height: 3,
			cells: [[0,0],[1,0],[2,0],[0,1],[0,2]],
			class: 'grey'
		},
		{ // The 3x3 L pointing south-east
			width: 3,
			height: 3,
			cells: [[2,0],[2,1],[2,2],[1,2],[0,2]],
			class: 'grey'
		},
		{ // The 3x3 L pointing south-west
			width: 3,
			height: 3,
			cells: [[0,0],[1,0],[2,0],[0,1],[0,2]],
			class: 'grey'
		},

		{ // Vertical thin 1x4
			width: 1,
			height: 4,
			cells: [[0,0],[0,1],[0,2],[0,3]],
			class: 'black'
		},
		{ // Horizontal thin 5x1
			width: 4,
			height: 1,
			cells: [[0,0],[1,0],[2,0],[3,0]],
			class: 'black'
		},

		{ // Vertical thin 1x5
			width: 1,
			height: 5,
			cells: [[0,0],[0,1],[0,2],[0,3],[0,4]],
			class: 'purple'
		},
		{ // Horizontal thin 5x1
			width: 5,
			height: 1,
			cells: [[0,0],[1,0],[2,0],[3,0],[4,0]],
			class: 'purple'
		}
	]
};