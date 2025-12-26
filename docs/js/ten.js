const ten = {
	drag: {},

	go: () => {
		// Build the board and the three palettes as matrices.
		ten.matrix( 'board', 10, 10 )

		// Have the glass listen to mouse events
		let glass = document.getElementById( 'glass' )
		glass.addEventListener( 'mouseup', ten.mouseReleased )
		glass.addEventListener( 'mousemove', ten.trackMouse )
		glass.addEventListener( 'mousedown', ten.mousePressed )
//		glass.addEventListener( 'mouseleave', table.mouseOut )

		// Make the game a-go!
		game.new()
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
		}
	}
};