const game = {
	swatches: [],

	/**
	 * Starts a new game.
	 */
	new: () => {
		ten.setScore( 0 )
		board.empty()
		game.nextPalette()
	},

	/**
	 * Fills the palette with three new random shapes
	 */
	nextPalette: () => {
		game.fillSwatch( 0, Math.floor( Math.random() * shapes.all.length ) )
		game.fillSwatch( 1, Math.floor( Math.random() * shapes.all.length ) )
		game.fillSwatch( 2, Math.floor( Math.random() * shapes.all.length ) )
	},

	/**
	 * Fill the given swatch with the given shape
	 */
	fillSwatch: ( swatch, s ) => {
		let shape = shapes.all[s]
		game.swatches[swatch] = shape
		game.swatches[swatch].shape = s

		let elem = document.getElementById( `swatch_${swatch}` )
		elem.setAttribute( 'data-drag', 'true' )
		elem.classList.remove( 'removed' )

		ten.matrix( `swatch_${swatch}`, shape.width, shape.height )
		for ( let cell of shape.cells ) {
			let x = cell[0]
			let y = cell[1]

			let elem = document.getElementById( `swatch_${swatch}_${x}_${y}` )
			elem.setAttribute( 'class', 'cell filled ' + shape.class )
		}
	},

	/**
	 * Removes a swatch option.
	 */
	emptySwatch: ( swatch ) => {
		game.swatches[swatch] = null
		let elem = document.getElementById( `swatch_${swatch}` )
		elem.removeAttribute( 'data-drag' )
		elem.classList.add( 'removed' )
		
		// If all three swatches are now empty we can invoke the next palette
		if ( game.swatches[0] === null && game.swatches[1] === null && game.swatches[2] === null ) {
			game.nextPalette()
		}
	}
};