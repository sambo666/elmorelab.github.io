window.addEventListener("load", function() {
	const STREAMERS_PATH = 'https://sambo666.github.io/elmorelab.github.io/streamers/streamers.json?v=123';
	//const STREAMERS_PATH = '../streamers/streamers.json?v=123';

	let clinetId = "eqeootvs7wxgswfm46vud0cu7tcreo";
	let clinetSecret = "0jiyngk8dxxok0olzilcu5pgepfqc4";

	//let youtubekey = 'AIzaSyBTJzjOBu60nHncD0QDcO-TsBXja8967rI';

	let numCallbackRuns = 0;
	let channels = [];

	const streamBlock = document.getElementById('-js-streams-list');
	if (!streamBlock) return;
	const category = streamBlock.dataset.stream;

	function getTwitchAuthorization() {
		let url = `https://id.twitch.tv/oauth2/token?client_id=${clinetId}&darkpopout&client_secret=${clinetSecret}&grant_type=client_credentials`;

		return fetch(url, {
			method: "POST",
		})
		.then((res) => res.json())
		.then((data) => {
			return data;
		});
	}

	async function getTwitchStreams(name) {
		const endpoint = `https://api.twitch.tv/helix/streams/?user_login=${name}`;

		let authorizationObject = await getTwitchAuthorization();
		let { access_token, expires_in, token_type } = authorizationObject;

		//token_type first letter must be uppercase
		token_type =
			token_type.substring(0, 1).toUpperCase() +
			token_type.substring(1, token_type.length);

		let authorization = `${token_type} ${access_token}`;

		let headers = {
			authorization,
			"Client-Id": clinetId,
		};

		fetch(endpoint, {
			headers,
		})
		.then((res) => res.json())
		.then((data) => {
			if (category === 'featured' && data.data?.length === 0) {
				const capOffline = document.querySelector('.-js-cap-offline');
				const capLoading = document.querySelector('.-js-cap-loading');
				capOffline.classList.remove('d-none');
				capLoading.classList.add('d-none');
			}
			if (data.data?.length > 0) {
				const thumbStr = data.data[0].thumbnail_url;
				const reW = /{width}/gi;
				const reH = /{height}/gi;
				let newStr = thumbStr.replace(reW, "780");
				newStr = newStr.replace(reH, "440");
				if(data.data[0].type == 'live') {
					const link = `https://player.twitch.tv/?channel=`+data.data[0].user_login+`&parent=elmorelab.com&autoplay=false&muted=false&theme=dark`;
					channels.push({
						'link': link,
						'login': data.data[0].user_login,
						'preview': newStr,
						'viewer_count': data.data[0].viewer_count
					});
				}
			}
		})
	}

	function renderStreams(data, el, currentStreamLink) {
		currentStreamLink.classList.add('d-none');
		const streamHtml = `<iframe
													src="`+data+`"
													frameborder="0" allowfullscreen="true" autoplay='false'>
												</iframe>`;
		el.insertAdjacentHTML('beforeend', streamHtml);
		// var options = {
		// 	channel: login,
		// 	autoplay: true
		// };
		// var player = new Twitch.Player(el, options);
	}

	function renderCards(data) {
		numCallbackRuns++;
		const previewLink = `<a class="stream-preview _ibg" href="javascript:void(0)">
													<span class="stream-status">ONLINE</span>
													<span class="stream-viewer">${data.viewer_count}</span>
													<img src=${data.preview} />
												</a>`;
		const streamHtml = `<div class="stream-card" id="card-${numCallbackRuns}">
													${previewLink}
												</div>`;
		streamBlock.insertAdjacentHTML('beforeend', streamHtml);
		const currentStream = document.getElementById(`card-${numCallbackRuns}`)
		const currentStreamLink = currentStream.querySelector('a');
		currentStreamLink.addEventListener('click', (e) => {
			e.preventDefault;
			renderStreams(data.link, currentStream, currentStreamLink);
		});
	}

	async function fetchStreamersJSON() {
		const response = await fetch(STREAMERS_PATH);
		const streamers = await response.json();
		return streamers;
	}

	const btn = document.querySelector('.-js-more-streams');
	const preloader = document.querySelector('.-js-preloader');
	const watchStreams = document.querySelector('.-js-watch-streams');

	fetchStreamersJSON().then(json => {
		const streamers = json[category];
		if (streamers.length > 0) {
			streamers.forEach( el => {
				if (el.twitch) {
					getTwitchStreams(el.twitch)
				}
			});
			setTimeout(() => {
				eachStreams()
				if (streamers.length > 4) {
					btn && btn.classList.remove('d-none');
				}
				if (watchStreams) {
					const watchNone = document.querySelector('.-js-watch-none');
					if (streamers.length === 0) {
						watchStreams.classList.add('d-none');
						watchNone.classList.remove('d-none');
					}
				}
				if (preloader) {
					preloader.classList.add('o-none');
					setTimeout(() => {
						preloader.classList.add('d-none');
					}, 3000);
				}
			}, 3000);
		}
	});

	if (btn) {
		btn.addEventListener('click', (e) => {
			e.preventDefault();
			eachStreams()
		})
	}

	function eachStreams() {
		const currentStreams = channels.splice(0, 4);
		currentStreams.forEach(el => {
			renderCards(el)
		});
		if (!channels.length) {
			btn && btn.classList.add('d-none');
		}
	}

})
