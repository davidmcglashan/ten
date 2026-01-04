const ten = {
	drag: {},
	swatchScaleFactor: 0,

	/**
	 * Called from index.html. Sets up the UI and resumes/starts the game.
	 */
	go: () => {
		// Build the board and the three swatches as matrices.
		ten.matrix( 'board', 10, 10 )

		// Have the glass listen to mouse events
		let glass = document.getElementById( 'glass' )
		glass.addEventListener( 'mousemove', ten.mouseMoved )
		glass.addEventListener( 'mousedown', ten.mousePressed )
		glass.addEventListener( 'mouseup', ten.mouseReleased )
		
		glass.addEventListener( 'touchmove', ten.touchMoved, { passive: false } )
		glass.addEventListener( 'touchstart', ten.touchPressed, { passive: false } )
		glass.addEventListener( 'touchend', ten.touchReleased, { passive: false } )

		// Make the game a-go ... If there's one in storage, use that!
		if ( !ten.restore() ) {
			game.new()
		}
	},

	/**
	 * Called from the UI. Starts a new game.
	 */
	restart: () => {
		game.new()
		ten.save()

		// Returning false here stops the event propagating further.
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
	mouseMoved: ( event ) => {
		// If we're dragging, do that instead ...
		if ( ten.drag.sourceElement ) {
			ten.mouseDragged( event )
			return
		}

		// Unset the drag state. The code following it will reinstate it.
		glass.setAttribute( 'class', '' )
		if ( ten.drag.swatchId ) {
			let elem = document.getElementById( ten.drag.swatchId )
			elem.classList.remove( 'hover' )
			ten.drag.swatchId = null
		}

		// Is there a swatch under the mouse.
		for ( let elem of document.elementsFromPoint( event.x, event.y ) ) {
			let drag = elem.getAttribute( 'data-drag' )
			if ( drag ) {
				let glass = document.getElementById( 'glass' )
				glass.setAttribute( 'class', 'hover' )
				ten.drag.swatchId = elem.getAttribute( 'id' )
				elem.classList.add( 'hover' )
			}
		}
	},

	/**
	 * A touch event has started. Work out where and handle accordingly.
	 */
	touchPressed: ( event ) => {
		// Stop iOS displaying the zoom loupe when this becomes a long press.
		event.preventDefault()

		// Bundle the co-ords of the touch into an object for readability now
		// and passing around later.
		let loc = {
			x: event.changedTouches[0].pageX,
			y: event.changedTouches[0].pageY
		}

		// Is there a swatch under the mouse. Touch has no prior knowledge of the swatch ID
		// from :hover interactions, and so we must work it out here.
		for ( let elem of document.elementsFromPoint( loc.x, loc.y ) ) {
			let drag = elem.getAttribute( 'data-drag' )
			if ( drag ) {
				ten.drag.swatchId = elem.getAttribute( 'id' )
				
				// Future drag events are offset from this x/y to stop the shape being drawn under
				// the finger. Ys get a healthy margin to push the shape away. Xs have to account for
				// the scale factor between the scaled-down swatch and the full-size shape being drawn
				// on the glass.
				loc.offsetX = ten.swatchScaleFactor * ( loc.x - elem.getBoundingClientRect().x )
				loc.offsetY = loc.y - elem.getBoundingClientRect().y + elem.getBoundingClientRect().height + 32
				ten.startDragging( loc )

				return
			}
		}
	},

	/**
	 * Handle a mouse press on the glass. This is used to start drags from the palette ...
	 */
	mousePressed: ( event ) => {
		// Don't do anything if the drag wasn't actioned by a swatch.
		if ( ten.drag.swatchId === null ) {
			return
		}
		
		// Calculate the offset based on the swatch position and the mouse position.
		let loc = {
			x: event.x,
			y: event.y
		}
		let xdiff = loc.x - event.offsetX
		let ydiff = loc.y - event.offsetY

		// Calculate the pointer/swatch offset. Mouse interactivity already knows the
		// swatch from the mouseMoved() method
		let swatch = document.getElementById( ten.drag.swatchId )
		loc.offsetX = loc.x - swatch.getBoundingClientRect().x + xdiff
		loc.offsetY = loc.y - swatch.getBoundingClientRect().y + ydiff
		
		ten.startDragging( loc )
	},

	/**
	 * Complete the setup of a drag. This code works for both touch and pointer and just
	 * does common DOM and data model stuff.
	 */
	startDragging: ( loc ) => {		
		// Grab a copy of the swatch first. Then mark the swatch as being dragged.
		let swatch = document.getElementById( ten.drag.swatchId )
		let copy = swatch.cloneNode(true)
		swatch.classList.add( 'removed' )
		
		// Tidy up the drag data model
		ten.drag.offsetX = loc.offsetX
		ten.drag.offsetY = loc.offsetY
		ten.drag.sourceElement = swatch
		ten.drag.sourceSwatch = ten.drag.swatchId.slice(-1)
		
		// Put that copy of the swatch on the glass.
		copy.classList.add( 'hover' )
		copy.setAttribute( 'id', 'dragShape' )
		copy.style.left = (loc.x - loc.offsetX) + 'px'
		copy.style.top = (loc.y - loc.offsetY) + 'px'

		let glass = document.getElementById( 'glass' )
		glass.appendChild( copy )
	},

	/**
	 * Handle touch events moving on the glass.
	 */
	touchMoved: ( event ) => {
		// Stop quickly if there's no drag happening.
		if ( !ten.drag.sourceElement ) {
			return
		}

		// Just use the last change as our basis here. We can overlook multiple events and just
		// use the most recent one.
		let index = event.changedTouches.length-1
		let loc = {
			x: event.changedTouches[index].pageX - ten.drag.offsetX,
			y: event.changedTouches[index].pageY - ten.drag.offsetY
		}

		// Move the shape.
		let elem = document.getElementById( 'dragShape'  )
		elem.style.left = `${loc.x}px`
		elem.style.top = `${loc.y}px`
	},

	/**
	 * Update the display during a drag operation.
	 */
	mouseDragged: ( event ) => {
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
	 * Handle a touch release event. The drag has stopped: it's time to drop.
	 */
	touchReleased: ( event ) => {
		// Don't do anything if the drag wasn't actioned by a swatch.
		if ( !ten.drag.swatchId ) {
			return
		}

		// Just use the last change as our basis here. We can overlook multiple events and just
		// use the most recent one.
		let index = event.changedTouches.length-1
		let loc = {
			x: event.changedTouches[index].pageX - ten.drag.offsetX + 12,
			y: event.changedTouches[index].pageY - ten.drag.offsetY + 12
		}
		ten.stopDragging( loc )
	},

	/**
	 * Handle a mouse release event. Used to drop shapes either onto the board or back into the palette
	 */
	mouseReleased: ( event ) => {
		// Don't do anything if the drag wasn't actioned by a swatch.
		if ( !ten.drag.swatchId ) {
			return
		}

		let loc = {
			x: event.x,
			y: event.y
		}
		ten.stopDragging( loc )
	},

	/**
	 * Handles the end of a drag from both touch and pointer events. The passed in object
	 * contains the x/y of the pointer/finger.
	 */
	stopDragging: ( loc ) => {
		// Undo the drag so the original item appears again. Remember the snapTo
		// location before we remove the source palette element.
		let snapTo = null
		if ( ten.drag.sourceElement ) {
			ten.drag.sourceElement.classList.remove( 'removed' )
			snapTo = ten.drag.sourceElement.getBoundingClientRect()
			ten.drag.sourceElement = null
		}

		// Some other useful vars to track.
		let drag = document.getElementById( 'dragShape'  )
		let cellGap = 3
		let placed = false
		
		// Did the drop take place over the board?
		try {
			for ( let elem of document.elementsFromPoint( loc.x, loc.y ) ) {
				let id = elem.getAttribute( 'id' )
				if ( id && id === 'board' ) {
					// Get the first cell in the dragged shape's mini-DOM and use its rect as the 
					// 'origin' of the drop, relative to the board's rect. This sidesteps doing
					// any pointer location shenanigans.
					let dropOrigin = drag.querySelector( ".cell" ).getBoundingClientRect()
					let boardOrigin = elem.getBoundingClientRect()

					// x & y should therefore be the rect's left and top, divided by the cell width.
					// 3 represents the gap between cells.
					let x = Math.round( ( dropOrigin.left - boardOrigin.left ) / (cellGap+dropOrigin.width) )
					let y = Math.round( ( dropOrigin.top - boardOrigin.top ) / (cellGap+dropOrigin.width) )

					// Ask the board to try and place the shape.
					placed = placed || board.placeShapeAt( game.swatches[ten.drag.sourceSwatch], x, y )
					if ( placed ) {
						 game.emptySwatch( ten.drag.sourceSwatch )
						 drag.remove()
					}
				}
			}
		} finally {
			// Remember the updated game state.
			ten.save()

			// If we didn't place the shape play a snapback animation.
			if ( !placed ) {
				let x = drag.getBoundingClientRect().left - snapTo.left
				let y = drag.getBoundingClientRect().top - snapTo.top
				drag.style.top = snapTo.top + 'px'
				drag.style.left = snapTo.left + 'px'
				drag.style.transform = `translate(${x}px,${y}px)`
				
				// Now apply an animation to remove the translation again.
				let anim = drag.animate([{opacity: 0.5, transform: 'translate(0px,0px)'}],{duration:150, easing: 'ease-in-out'});
				anim.pause()
				anim.onfinish = () => {
					drag.remove()
				}
				anim.play()
			}
		}
	},

	/**
	 * Update the DOM when a swatch is filled.
	 */
	fillSwatch: ( swatchIndex, shape) => {
		let elem = document.getElementById( `swatch_${swatchIndex}` )
		elem.setAttribute( 'data-drag', 'true' )
		elem.classList.remove( 'removed' )

		ten.matrix( `swatch_${swatchIndex}`, shape.width, shape.height )
		for ( let cell of shape.cells ) {
			let x = cell[0]
			let y = cell[1]

			let elem = document.getElementById( `swatch_${swatchIndex}_${x}_${y}` )
			elem.setAttribute( 'class', 'cell filled ' + shape.class )
		}

		// Update the swatch scale factor if it's set to zero.
		if ( ten.swatchScaleFactor === 0 ) {
			let board = document.getElementById( 'board' )
			let boardCell = board.querySelector( ".cell" ).getBoundingClientRect()
			let swatchCell = elem.querySelector( ".cell" ).getBoundingClientRect()

			ten.swatchScaleFactor = boardCell.width / swatchCell.width
		}
	},

	/**
	 * Update the DOM when a swatch is emptied.
	 */
	emptySwatch: ( swatchIndex ) => {
		let elem = document.getElementById( `swatch_${swatchIndex}` )
		elem.removeAttribute( 'data-drag' )
		elem.classList.add( 'removed' )
	},

	/**
	 * Called when the score is changed. Does DOM stuff.
	 */
	updateScore: ( score, hiscore ) => {
		let elem = document.getElementById( 'score'  )
		elem.innerHTML = score.toLocaleString()

		elem = document.getElementById( 'hi-score'  )
		if ( score === hiscore ) {
			elem.innerHTML = 'new hi-score'
		} else {
			elem.innerHTML = `hi-score: ${hiscore.toLocaleString()}`
		}
	},

	/**
	 * Save the game state into localstorage
	 */
	save: () => {
		// Remember the score
		let state = {}
		state.score = game.score
		
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
		state.swatch0 = game.swatches[0] ? game.swatches[0].shape : null
		state.swatch1 = game.swatches[1] ? game.swatches[1].shape : null
		state.swatch2 = game.swatches[2] ? game.swatches[2].shape : null

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
		game.setScore( saved.score )

		// Restore the swatches
		if ( saved.hasOwnProperty('swatch0' ) && saved.swatch0 !== null ) {	
			game.fillSwatch( 0, saved.swatch0 ) 
		} else {
			game.swatches[0] = null
		}
		if ( saved.hasOwnProperty('swatch1' ) && saved.swatch1 !== null  ) {	
			game.fillSwatch( 1, saved.swatch1 ) 
		} else {
			game.swatches[1] = null
		}
		if ( saved.hasOwnProperty('swatch2' ) && saved.swatch2 !== null  ) {	
			game.fillSwatch( 2, saved.swatch2 ) 
		} else {
			game.swatches[2] = null
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