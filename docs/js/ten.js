const ten = {
	drag: {},
	score: 0,

	go: () => {
		// Build the board and the three palettes as matrices.
		ten.matrix( 'board', 10, 10 )

		// Have the glass listen to mouse events
		let glass = document.getElementById( 'glass' )
		glass.addEventListener( 'mouseup', ten.mouseReleased )
		glass.addEventListener( 'mousemove', ten.trackMouse )
		glass.addEventListener( 'mousedown', ten.mousePressed )
//		glass.addEventListener( 'mouseleave', table.mouseOut )

		// Make the game a-go ... If there's one in storage, use that!
		if ( !ten.restore() ) {
			game.new()
		}
	},

	restart: () => {
		game.new()
		return false
	},

	/**
	 * Renders a matrix into the DOM
	 */
	matrix: ( name, width, height ) => {
		let board = document.getElementById( name )
		board.innerHTML = ''

		for ( let y=0; y<height; y++ ) {
			let row = document.createElement( 'div' )
			row.setAttribute( 'class', 'row' )
			board.appendChild( row )

			for ( let x=0; x<width; x++ ) {
				let cell = document.createElement( 'div' )
				cell.setAttribute( 'id', `${name}_${x}_${y}` )
				cell.setAttribute( 'class', 'cell' )
				row.appendChild( cell )
			}
		}
	},

	/**
	 * Update the page element affordances as the mouse moves around.
	 */
	trackMouse: ( event ) => {
		// If we're dragging, do that instead ...
		if ( ten.drag.sourceElement ) {
			ten.dragMouse( event )
			return
		}

		// Forget everything. The code following it will reinstate the state.
		glass.setAttribute( 'class', '' )
		ten.drag.canDrag = null

		// Is there a palette under the mouse.
		for ( let elem of document.elementsFromPoint( event.x, event.y ) ) {
			let id = elem.getAttribute( 'id' )
			if ( id && id.startsWith( 'palette_' ) ) {
				let glass = document.getElementById( 'glass' )
				glass.setAttribute( 'class', 'hover' )
				ten.drag.canDrag = id
			}
		}
	},

	/**
	 * Update the display during a drag operation.
	 */
	dragMouse: ( event ) => {
		// If there's no drag then there's no dice.
		if ( !ten.drag.sourceElement ) {
			return
		}

		// Move the element being dragged to track the mouse.
		let elem = document.getElementById( 'dragShape'  )
		elem.style.left = (event.x - ten.drag.offsetX) + 'px'
		elem.style.top = (event.y - ten.drag.offsetY) + 'px'
	},

	/**
	 * Handle a mouse press on the glass. This is used to start drags from the palette ...
	 */
	mousePressed: ( event ) => {
		// Don't do anything if a drag can't be actioned.
		if ( ten.drag.canDrag === null ) {
			return
		}

		let palette = document.getElementById( ten.drag.canDrag )
		let copy = palette.cloneNode(true)
		palette.classList.toggle( 'dragging' )
		ten.drag.sourceElement = palette
		ten.drag.sourcePalette = ten.drag.canDrag.slice(-1)

		// Calculate the offset based on the palette position and the mouse position.
		let xdiff = event.x - event.offsetX
		let ydiff = event.y - event.offsetY
		ten.drag.offsetX = event.x - palette.getBoundingClientRect().x + xdiff
		ten.drag.offsetY = event.y - palette.getBoundingClientRect().y + ydiff
		
		// Put a copy of the palette on the glass.
		copy.setAttribute( 'id', 'dragShape' )
		copy.style.left = (event.clientX - ten.drag.offsetX) + 'px'
		copy.style.top = (event.clientY - ten.drag.offsetY) + 'px'

		let glass = document.getElementById( 'glass' )
		glass.appendChild( copy )
	},

	/**
	 * Handle a mouse release event. Used to drop shapes either onto the board or back into the palette
	 */
	mouseReleased: ( event ) => {
		// Undo the drag so the original item appears again.
		if ( ten.drag.sourceElement ) {
			ten.drag.sourceElement.classList.toggle( 'dragging' )
			ten.drag.sourceElement = null
		}
		
		// Did the drop take place over the board?
		let drag = document.getElementById( 'dragShape'  )
		try {
			for ( let elem of document.elementsFromPoint( event.x, event.y ) ) {
				let id = elem.getAttribute( 'id' )
				if ( id && id === 'board' ) {
					let dropOrigin = drag.querySelector( ".cell" ).getBoundingClientRect()
					let boardOrigin = elem.getBoundingClientRect()
					let x = Math.round( ( dropOrigin.left - boardOrigin.left ) / (3+dropOrigin.width) )
					let y = Math.round( ( dropOrigin.top - boardOrigin.top ) / (3+dropOrigin.width) )
					
					if ( board.placeShapeAt( game.palette[ten.drag.sourcePalette], x, y ) ) {
						 game.emptyPalette( ten.drag.sourcePalette )
					} else {
						// animate snapback
					}
				}
			}
		} finally {
			// Remove the copy from glass
			if ( drag ) {
				drag.remove()
			}
			ten.save()
		}
	},

	addToScore: ( inc ) => {
		ten.score += inc
		let elem = document.getElementById( 'score'  )
		elem.innerHTML = ten.score
	},

	setScore: ( inc ) => {
		ten.score = inc
		let elem = document.getElementById( 'score'  )
		elem.innerHTML = ten.score
	},

	/**
	 * Save the game state into localstorage
	 */
	save: () => {
		// Remember the score
		let state = {}
		state.score = ten.score
		
		// Remember the cells
		state.cells = []
		for ( let y=0; y<10; y++ ) {
			for ( let x=0; x<10; x++ ) {
				if ( board.matrix[y][x] !== 0 ) {
					let cell = {}
					cell.x = x
					cell.y = y

					let elem = document.getElementById( `board_${x}_${y}` )
					cell.css = elem.getAttribute( 'class' ).replace( 'cell', '' ).replace( 'filled', '' ).trim()
					state.cells.push(cell)
				}
			}
		}

		// Remember the palettes
		state.palette0 = game.palette[0] ? game.palette[0].shape : null
		state.palette1 = game.palette[1] ? game.palette[1].shape : null
		state.palette2 = game.palette[2] ? game.palette[2].shape : null

		// Stick it all in storage ...
		localStorage['ten.state'] = JSON.stringify( state )
	},

	/**
	 * Restore the game from localstorage. If this should fail then a new game is set up.
	 */
	restore: () => {
		// First inspect the 
		let savedStr = localStorage['ten.state']
		if ( !savedStr ) {
			return false
		}
		let saved = JSON.parse( savedStr )

		// Restore the score
		ten.setScore( saved.score )

		// Restore the palettes
		if ( saved.palette0 ) {	
			game.fillPalette( 0, saved.palette0 ) 
		} else {
			game.palette[0] = null
		}
		if ( saved.palette1 ) {	
			game.fillPalette( 1, saved.palette1 ) 
		} else {
			game.palette[1] = null
		}
		if ( saved.palette2 ) {	
			game.fillPalette( 2, saved.palette2 ) 
		} else {
			game.palette[2] = null
		}

		// Restore the board
		board.empty()
		for ( let cell of saved.cells ) {
			board.matrix[cell.y][cell.x] = 1
			let elem = document.getElementById( `board_${cell.x}_${cell.y}` )
			elem.setAttribute( 'class', 'cell filled ' + cell.css )
		}

		return true
	}
};