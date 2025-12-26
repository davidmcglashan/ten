const shapes = {
	all: [
		{	// The 1x1 square one
			width: 1,
			height: 1,
			cells: [[0,0]]
		},

		{	// The 2x2 square one
			width: 2,
			height: 2,
			cells: [[0,0],[0,1],[1,0],[1,1]]
		},

		{ // 2x2 square with hole north-east
			width: 2,
			height: 2,
			cells: [[0,0],[0,1],[1,1]]
		},
		{ // 2x2 square with hole north-west
			width: 2,
			height: 2,
			cells: [[1,0],[0,1],[1,1]]
		},
		{ // 2x2 square with hole south-east
			width: 2,
			height: 2,
			cells: [[0,0],[0,1],[1,0]]
		},
		{ // 2x2 square with hole south-west
			width: 2,
			height: 2,
			cells: [[0,0],[1,0],[1,1]]
		},

		{ // Vertical thin 1x5
			width: 1,
			height: 5,
			cells: [[0,0],[0,1],[0,2],[0,3],[0,4]]
		},
		{ // Horizontal thin 5x1
			width: 5,
			height: 1,
			cells: [[0,0],[1,0],[2,0],[3,0],[4,0]]
		}
	]
};