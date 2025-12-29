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
			ten.addToScore( 1 )
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

		// Score 10 for each row removed, with subsequent rows happening at the same time
		// counting double.
		let removals = toRemove.rows.length + toRemove.cols.length
		let factor = 10
		for ( let i=0; i<removals; i++ ) {
			ten.addToScore( factor )
			factor = 2*factor
		}
		
		// Remove that which is to be removed.
		for ( let y of toRemove.rows ) {
			for ( let x=0; x<10; x++ ) {
				board.matrix[y][x] = 0
				let elem = document.getElementById( `board_${x}_${y}` )
				elem.setAttribute( 'class', 'cell' )
			}
		}
		for ( let x of toRemove.cols ) {
			for ( let y=0; y<10; y++ ) {
				board.matrix[y][x] = 0
				let elem = document.getElementById( `board_${x}_${y}` )
				elem.setAttribute( 'class', 'cell' )
			}
		}
	}
};