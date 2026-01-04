const game = {
	score: 0,
	hiscore: localStorage['ten.hiscore'] | 0,
	swatches: [],

	/**
	 * Starts a new game.
	 */
	new: () => {
		game.setScore( 0 )
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
	fillSwatch: ( swatchIndex, shapeIndex ) => {
		let shape = shapes.all[shapeIndex]
		game.swatches[swatchIndex] = shape
		game.swatches[swatchIndex].shape = shapeIndex
		ten.fillSwatch( swatchIndex, shape )
	},

	/**
	 * Removes a swatch option.
	 */
	emptySwatch: ( swatchIndex ) => {
		game.swatches[swatchIndex] = null
		ten.emptySwatch( swatchIndex )
		
		// If all three swatches are now empty we can invoke the next palette
		if ( game.swatches[0] === null && game.swatches[1] === null && game.swatches[2] === null ) {
			game.nextPalette()
		}
	},

	/**
	 * Add the passed in increment value to the game's score.
	 */
	addToScore: ( inc ) => {
		game.score += inc
		if ( game.score > game.hiscore ) {
			game.hiscore = game.score
			localStorage['ten.hiscore'] = game.hiscore
		}
		ten.updateScore( game.score, game.hiscore )
	},

	/**
	 * Set the game's score. This is used to restore saved games and doesn't
	 * do any highscore shenanigans.
	 */
	setScore: ( inc ) => {
		game.score = inc
		ten.updateScore( game.score, game.hiscore )
	},
};