/* global d3 */
import lottie from 'lottie-web'

let animation = null
let container = d3.select('#bodymovin')
let container2 = document.getElementById('bodymovin')

function resize() {}

function loadAnimation(){
	d3.loadData('assets/animation/data.json',
		(err, response) => {
			if (err) console.log(err)
			else{
				animation = response[0]
				setupAnimation()
			}
		})
}

function setupAnimation(){
	const animData = {
		container: container2,
		autoplay: true,
		loop: true,
		animationData: animation
	}

	let dance = lottie.loadAnimation(animData)

	let hair = d3.select('.hair').select('g').select('path')

	container.on('click', d => {
		hair.style('fill', 'yellow')
	})

	console.log({hair})
}

function init() {
	loadAnimation()
}

export default { init, resize };
