window.onload = function () {

	const STREAMERS_PATH = 'https://sambo666.github.io/elmorelab.github.io/streamers/streamers.json?v=123';

	let clinetId = "eqeootvs7wxgswfm46vud0cu7tcreo";
	let clinetSecret = "0jiyngk8dxxok0olzilcu5pgepfqc4";

	//let youtubekey = 'AIzaSyBTJzjOBu60nHncD0QDcO-TsBXja8967rI';

	let numCallbackRuns = 0;
	let links = [];

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
			if(data.data?.length > 0) {
				if(data.data[0].type == 'live') {
					const link = `https://player.twitch.tv/?channel=`+data.data[0].user_login+`&parent=elmorelab.com&autoplay=false&muted=false&theme=dark`;
					links.push(link);
					renderStreams(link);
				}
			}
		})
	}

	function renderStreams(data) {
		let hide = '';
		numCallbackRuns++;
		if (numCallbackRuns > 4) {
			hide = 'd-none';
			return;
		}
		const streamHtml = `<div class="stream-card ${hide}">
																<iframe
																		src="`+data+`"
																		frameborder="0" allowfullscreen="true" autoplay='false'>
																</iframe>
															</div>`;
		streamBlock.insertAdjacentHTML('beforeend', streamHtml);
	}

	async function fetchStreamersJSON() {
		const response = await fetch(STREAMERS_PATH);
		const streamers = await response.json();
		return streamers;
	}

	fetchStreamersJSON().then(json => {
		const streamers = json[category];
		if (streamers.length > 0) {
			streamers.forEach( el => {
				if (el.twitch) {
					getTwitchStreams(el.twitch)
				}
			});
		}
	});

	const btn = document.querySelector('.-js-more-streams');
	if (btn) {
		btn.addEventListener('click', (e) => {
			e.preventDefault();
			links.splice(0, 4);
			numCallbackRuns = 0;
			links.forEach(el => {
				renderStreams(el)
			});
			if (!links.length) {
				btn.classList.add('d-none');
			}
			//console.log(numCallbackRuns)
		})
	}
}