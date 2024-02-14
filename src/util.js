export function resizeImage(file, width, height, quality) {
	return new Promise((resolve, reject) => {

		if (isNaN(width)) {
			reject('넓이를 숫자로 입력하세요.')
		}

		if (isNaN(height)) {
			reject('높이를 숫자로 입력하세요.')	
		}

		const reader = new FileReader()

		reader.readAsDataURL(file)

		reader.onload = function() {
			const image = new Image()

			image.src = reader.result

			image.onload = function() {
				const canvas = document.createElement('canvas')
				canvas.width = width
				canvas.height = height
				const ctx = canvas.getContext('2d');
				if (image.width / image.height >= width / height) {
					const w = width * image.width / image.height
					const x = (w - width) / 2 * -1
					ctx.drawImage(image, x, 0, w, height)
				} else {
					const h = height * image.height / image.width
					const y = (h - height) / 2 * -1
					ctx.drawImage(image, 0, y, width, h)
				}
				try {
					canvas.toBlob(blob => {
						resolve(blob)
					}, file.type, !quality ? .8 : quality)
				} catch(error) {
					reject(error)
				}
			}

			image.onerror = function(event) {
				reject(event)
			}
		}

		reader.onerror = function(event) {
			reject(event)
		}
	})
}

export function goBack() {
}