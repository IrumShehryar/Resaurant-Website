/**
 * Minimal modal UI factory.
 *
 * This lightweight component creates a modal root in the document when
 * first used and exposes a small API:
 *
 *   const modal = createModal()
 *   modal.setContent('<p>hi</p>')
 *   modal.open()
 *
 * Methods:
 * - open(): show the modal
 * - close(): hide the modal and call onClose if set
 * - setContent(htmlOrNode): set inner content (string or Node)
 * - setOnClose(cb): register a callback fired when the modal closes
 *
 * Accessibility & behavior:
 * - Escape key closes the modal
 * - Clicking the backdrop (outside the box) closes the modal
 * - If the content includes an element with id="modal-close", it will be
 *   wired to call close() automatically.
 */
export const createModal = () => {
	let root = null
	let onClose = null

	function ensure() {
		if (root) return root
		root = document.createElement('div')
		root.id = 'modal-root'
		// very small inline styles so it's visible; replace with CSS later
		root.style.position = 'fixed'
		root.style.left = '0'
		root.style.top = '0'
		root.style.width = '100%'
		root.style.height = '100%'
		root.style.display = 'none'
		// backdrop color (semi-transparent) so modal stands out; change in CSS if desired
		root.style.background = 'rgba(0,0,0,0.45)'
		// ensure modal overlays other UI (buttons use high z-index too)
		root.style.zIndex = '10050'
		// center modal box with flex and add padding around the viewport
		root.style.display = 'none'
		root.style.alignItems = 'center'
		root.style.justifyContent = 'center'
		root.style.padding = '1.25rem'

		root.innerHTML = `
			<div id="modal-box" style="max-width:56.25rem; width: min(100%, 56.25rem); box-sizing: border-box; max-height:calc(100vh - 2.5rem); background:var(--modal-bg,#fff); padding:0.75rem; overflow:auto; box-shadow:0 0.625rem 1.875rem rgba(0,0,0,0.5); border-radius:0.375rem;">
				<div id="modal-content"></div>
			</div>
		`

		// backdrop click closes
		root.addEventListener('click', (ev) => {
			if (ev.target === root) close()
		})

		// ESC closes
		const escHandler = (ev) => { if (ev.key === 'Escape') close() }
		document.addEventListener('keydown', escHandler)
		root._escHandler = escHandler

		document.body.appendChild(root)
		return root
	}

	/**
	 * Replace the modal content. Accepts HTML string or DOM Node.
	 * When a node with id="modal-close" is present, it will be wired to
	 * close the modal for convenience.
	 *
	 * @param {string|Node} htmlOrNode
	 */
	function setContent(htmlOrNode) {
		const r = ensure()
		const content = r.querySelector('#modal-content')
		content.innerHTML = ''
		if (typeof htmlOrNode === 'string') content.innerHTML = htmlOrNode
		else if (htmlOrNode instanceof Node) content.appendChild(htmlOrNode)

		// wire internal close button if renderer provides one with id="modal-close"
		const closeBtn = content.querySelector('#modal-close')
		if (closeBtn) closeBtn.addEventListener('click', () => close())
	}

	/** Show the modal. */
	function open() {
		const r = ensure()
		// use flex to allow centering via alignItems/justifyContent
		r.style.display = 'flex'
	}

	/** Hide the modal and call the optional onClose callback. */
	function close() {
		if (!root) return
		root.style.display = 'none'
		if (typeof onClose === 'function') onClose()
	}

	/** Set an optional callback fired when the modal closes. */
	function setOnClose(cb) { onClose = cb }

	return { open, close, setContent, setOnClose }
}

