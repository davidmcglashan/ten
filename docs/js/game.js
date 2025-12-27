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
	 * Fills the palette with three new random shapes
	 */
	nextPalette: () => {
		game.fillPalette( 0, Math.floor( Math.random() * shapes.all.length ) )
		game.fillPalette( 1, Math.floor( Math.random() * shapes.all.length ) )
		game.fillPalette( 2, Math.floor( Math.random() * shapes.all.length ) )
	},

	/**
	 * Fill the given palette with the given shape
	 */
	fillPalette: ( palette, s ) => {
		let shape = shapes.all[s]
		game.palette[palette] = shape
		game.palette[palette].shape = s

		ten.matrix( `palette_${palette}`, shape.width, shape.height )
		for ( let cell of shape.cells ) {
			let x = cell[0]
			let y = cell[1]

			let elem = document.getElementById( `palette_${palette}_${x}_${y}` )
			elem.setAttribute( 'class', 'cell filled ' + shape.class )
		}
	},

	/**
	 * Removes a palette option.
	 */
	emptyPalette: ( palette ) => {
		game.palette[palette] = null
		let elem = document.getElementById( `palette_${palette}` )
		elem.innerHTML = ''
		
		// If all three palettes are now empty we can invoke the next palette
		if ( game.palette[0] === null && game.palette[1] === null && game.palette[2] === null ) {
			game.nextPalette()
		}
	}
};