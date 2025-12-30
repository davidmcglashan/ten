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

		glass.addEventListener( 'touchstart', ten.touchStarted, { passive: false } )
		glass.addEventListener( 'touchmove', ten.touchMoved, { passive: false } )
		glass.addEventListener( 'touchend', ten.touchEnded, { passive: false } )

		// Make the game a-go ... If there's one in storage, use that!
		if ( !ten.restore() ) {
			game.new()
		}
	},

	restart: () => {
		game.new()
		ten.save()
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
		ten.drag.paletteId = null

		// Is there a palette under the mouse.
		for ( let elem of document.elementsFromPoint( event.x, event.y ) ) {
			let drag = elem.getAttribute( 'data-drag' )
			if ( drag ) {
				let glass = document.getElementById( 'glass' )
				glass.setAttribute( 'class', 'hover' )
				ten.drag.paletteId = elem.getAttribute( 'id' )
			}
		}
	},

	touchMoved: ( event ) => {
		// Just use the last change as our basis here. We can overlook multiple events and just
		// use the most recent one.
		let index = event.changedTouches.length-1
		let interact = {
			x: event.changedTouches[index].pageX - ten.drag.offsetX,
			y: event.changedTouches[index].pageY - ten.drag.offsetY
		}

		let elem = document.getElementById( 'dragShape'  )
		elem.style.left = (interact.x) + 'px'
		elem.style.top = (interact.y) + 'px'
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

	touchStarted: ( event ) => {
		let interact = {
			x: event.changedTouches[0].pageX,
			y: event.changedTouches[0].pageY
		}

		// Is there a palette under the mouse. Touch has no prior knowledge of the palette ID
		// from :hover interactions, and so we must work it out here.
		for ( let elem of document.elementsFromPoint( interact.x, interact.y ) ) {
			let drag = elem.getAttribute( 'data-drag' )
			if ( drag ) {
				ten.drag.paletteId = elem.getAttribute( 'id' )
				interact.offsetX = interact.x - elem.getBoundingClientRect().x
				interact.offsetY = interact.y - elem.getBoundingClientRect().y
				ten.interactOn( interact )
				return
			}
		}
	},

	/**
	 * Handle a mouse press on the glass. This is used to start drags from the palette ...
	 */
	mousePressed: ( event ) => {
		// Don't do anything if the drag wasn't actioned by a palette.
		if ( ten.drag.paletteId === null ) {
			return
		}
		
		// Calculate the offset based on the palette position and the mouse position.
		let interact = {
			x: event.x,
			y: event.y
		}
		let xdiff = interact.x - event.offsetX
		let ydiff = interact.y - event.offsetY

		// Calculate the pointer/palette offset. Mouse interactivity already knows the
		// palette from the trackMouse() method
		let palette = document.getElementById( ten.drag.paletteId )
		interact.offsetX = interact.x - palette.getBoundingClientRect().x + xdiff
		interact.offsetY = interact.y - palette.getBoundingClientRect().y + ydiff
		
		ten.interactOn( interact )
	},

	/**
	 * Complete the setup of a drag. This code works for both touch and pointer and just
	 * does common DOM and data model stuff.
	 */
	interactOn: ( interact ) => {		
		// Grab a copy of the palette first. Then mark the palette as being dragged.
		let palette = document.getElementById( ten.drag.paletteId )
		let copy = palette.cloneNode(true)
		palette.classList.toggle( 'dragging' )
		
		// Tidy up the drag data model
		ten.drag.offsetX = interact.offsetX
		ten.drag.offsetY = interact.offsetY
		ten.drag.sourceElement = palette
		ten.drag.sourcePalette = ten.drag.paletteId.slice(-1)
		
		// Put that copy of the palette on the glass.
		copy.setAttribute( 'id', 'dragShape' )
		copy.style.left = (interact.x - interact.offsetX) + 'px'
		copy.style.top = (interact.y - interact.offsetY) + 'px'

		let glass = document.getElementById( 'glass' )
		glass.appendChild( copy )
	},

	touchEnded: ( event ) => {
		// Don't do anything if the drag wasn't actioned by a palette.
		if ( !ten.drag.paletteId ) {
			return
		}

		// Just use the last change as our basis here. We can overlook multiple events and just
		// use the most recent one.
		let index = event.changedTouches.length-1
		let interact = {
			x: event.changedTouches[index].pageX - ten.drag.offsetX,
			y: event.changedTouches[index].pageY - ten.drag.offsetY
		}
		ten.interactOff( interact )
	},

	/**
	 * Handle a mouse release event. Used to drop shapes either onto the board or back into the palette
	 */
	mouseReleased: ( event ) => {
		// Don't do anything if the drag wasn't actioned by a palette.
		if ( !ten.drag.paletteId ) {
			return
		}

		let interact = {
			x: event.x,
			y: event.y
		}
		ten.interactOff( interact )
	},

	interactOff: ( interact ) => {
		// Undo the drag so the original item appears again.
		if ( ten.drag.sourceElement ) {
			ten.drag.sourceElement.classList.toggle( 'dragging' )
			ten.drag.sourceElement = null
		}
		
		// Did the drop take place over the board?
		let drag = document.getElementById( 'dragShape'  )
		try {
			for ( let elem of document.elementsFromPoint( interact.x, interact.y ) ) {
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