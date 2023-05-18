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
				if(data.data[0].type == 'live') {
					//const link = `https://player.twitch.tv/?channel=`+data.data[0].user_login+`&parent=elmorelab.com&autoplay=false&muted=false&theme=dark`;
					channels.push(data.data[0].user_login);
				}
			}
		})
	}

	function renderStreams(data) {
		let hide = '';
		numCallbackRuns++;
		const streamHtml = `<div class="stream-card ${hide}" id="card-${numCallbackRuns}">
														</div>`;
		streamBlock.insertAdjacentHTML('beforeend', streamHtml);

		var options = {
			channel: data,
			autoplay: false
		};

		const currentStream = document.getElementById(`card-${numCallbackRuns}`)
		var player = new Twitch.Player(currentStream, options);
	}

	async function fetchStreamersJSON() {
		const response = await fetch(STREAMERS_PATH);
		const streamers = await response.json();
		return streamers;
	}

	const btn = document.querySelector('.-js-more-streams');

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
			}, 1000);
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
			renderStreams(el)
		});
		if (!channels.length) {
			btn && btn.classList.add('d-none');
		}
	}

})
