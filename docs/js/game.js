const game = {
	palette: [],

	/**
	 * Starts a new game.
	 */
	new: () => {
		board.empty()
		game.nextPalette()
	},

	/**
	 * Fills the palette with three new shapes
	 */
	nextPalette: () => {
		game.fillPalette( 0, 0 )
		game.fillPalette( 1, 1 )
		game.fillPalette( 2, 2 )
	},

	/**
	 * Fill the given palette with the given shape
	 */
	fillPalette: ( palette, s ) => {
		let shape = shapes.all[s]
		game.palette[palette] = shape

		ten.matrix( `palette_${palette}`, shape.width, shape.height )
		for ( let cell of shape.cells ) {
			let x = cell[0]
			let y = cell[1]

			let elem = document.getElementById( `palette_${palette}_${x}_${y}` )
			elem.setAttribute( 'class', 'cell filled' )
		}
	}
};