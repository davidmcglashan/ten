const board = {
	matrix: [],

	/**
	 * Creates an empty board.
	 */
	empty: () => {
		for ( let y=0; y<10; y++ ) {
			board.matrix[y] = []
			for ( let x=0; x<10; x++ ) {
				board.matrix[y][x] = 0

				let elem = document.getElementById( `board_${x}_${y}` )
				elem.setAttribute( 'class', 'cell' )
			}
		}
	},

	/**
	 * Places the shape at x,y. Returns false if this isn't possible.
	 */
	placeShapeAt: ( shape, dropX, dropY ) => {
		// Does this shape fit here?
		for ( let cell of shape.cells ) {
			let x = dropX + cell[0]
			let y = dropY + cell[1]
			if ( board.matrix[y][x] !== 0 ) {
				return false
			}
		}

		// Fit the shape
		for ( let cell of shape.cells ) {
			let x = dropX + cell[0]
			let y = dropY + cell[1]
			board.matrix[y][x] = 1
			
			let elem = document.getElementById( `board_${x}_${y}` )
			elem.setAttribute( 'class', 'cell filled ' + shape.class )
			game.addToScore( 1 )
		}

		board.checkForFills()
		return true
	},

	checkForFills: () => {
		let toRemove = {cols:[],rows:[]}

		// Check the rows.
		for ( let y=0; y<10; y++ ) {
			// Gather a score by summing the cells in the row.
			let rowScore = 0
			for ( let x=0; x<10; x++ ) {
				rowScore += board.matrix[y][x]
			}
			// If a row scores 10 it's full and can be removed.
			if ( rowScore === 10 ) {
				toRemove.rows.push(y)
			}
		}

		// Check the columns by the same method
		for ( let x=0; x<10; x++ ) {
			let colScore = 0
			for ( let y=0; y<10; y++ ) {
				colScore += board.matrix[y][x]
			}
			if ( colScore === 10 ) {
				toRemove.cols.push(x)
			}
		}

		// Quit early if nothing got removed.
		let removals = toRemove.rows.length + toRemove.cols.length
		if ( removals === 0 ) {
			return
		}
		
		// Score 10 for each row removed, with subsequent rows happening at the same time
		// counting double.
		let factor = 10
		for ( let i=0; i<removals; i++ ) {
			game.addToScore( factor )
			factor = 2*factor
		}
		
		// Remove that which is to be removed.
		let elems = {}
		for ( let i=0; i<10; i++ ) {
			for ( let y of toRemove.rows ) {
				board.matrix[y][i] = 0
				if ( !elems[`${y}_${i}`] ) {
					elems[`${y}_${i}`] = document.getElementById( `board_${i}_${y}` )
				}
			}
			for ( let x of toRemove.cols ) {
				board.matrix[i][x] = 0
				if ( !elems[`${i}_${x}`] ) {
					elems[`${i}_${x}`] = document.getElementById( `board_${x}_${i}` )
				}
			}
		}

		// Play a little animation rather than simply disappearing the cell.
		let delay = 0
		let offset = 20/removals
		for ( let [key,elem] of Object.entries(elems) ) {
			let anim = elem.animate([{transform: 'scale(0)'}],{duration:150, delay: delay, easing: 'ease-in-out'});
			delay += offset
			anim.pause()

			// All the tidy up takes place when the animation finishes.
			anim.onfinish = () => {
				elem.setAttribute( 'class', 'cell' )
			}
			anim.play()
		}
	}
};