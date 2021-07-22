import React from 'react';
import Layout from './HUD/Layout/Layout';
import { port, isDev } from './api/api';
import ActionManager, { ConfigManager } from './api/actionManager';
import { Dota2, DOTA2GSI } from 'dotagsi';
import { io } from "socket.io-client";

const DOTA2 = new DOTA2GSI();
const socket = io(isDev ? `localhost:${port}` : '/');

socket.on('update', (data: any) => {
	DOTA2.digest(data);
});

export const actions = new ActionManager();
export const configs = new ConfigManager();

export const hudIdentity = {
	name: '',
	isDev: false
};
/*
interface DataLoader {
	match: Promise<void> | null
}
/*
const dataLoader: DataLoader = {
	match: null
}*/

class App extends React.Component<any, { game: Dota2 | null }> {
	constructor(props: any) {
		super(props);
		this.state = {
			game: null
		}
	}

	verifyPlayers = async (game: any) => {
		/*const steamids = game.players.map(player => player.steamid);
		steamids.forEach(steamid => {
			loadAvatarURL(steamid);
		})

		if (steamids.every(steamid => this.state.steamids.includes(steamid))) {
			return;
		}

		const loaded = GSI.players.map(player => player.steamid);

		const extensioned = await api.players.get();

		const lacking = steamids.filter(steamid => !loaded.includes(steamid)).filter(steamid => extensioned.map(player => player.steamid).includes(steamid));

		const players: PlayerExtension[] = extensioned
			.filter(player => lacking.includes(player.steamid))
			.map(player => (
				{
					id: player._id,
					name: player.username,
					realName: `${player.firstName} ${player.lastName}`,
					steamid: player.steamid,
					country: player.country,
					avatar: player.avatar,
					extra: player.extra,
				})
			);

		const gsiLoaded = GSI.players;

		gsiLoaded.push(...players);

		GSI.players = gsiLoaded;

		this.setState({ steamids });*/
	}


	componentDidMount() {
		this.loadMatch();
		const href = window.location.href;
		socket.emit("started");
		let isDev = false;
		let name = '';
		if (href.indexOf('/huds/') === -1) {
			isDev = true;
			name = (Math.random() * 1000 + 1).toString(36).replace(/[^a-z]+/g, '').substr(0, 15);
			hudIdentity.isDev = true;
		} else {
			const segment = href.substr(href.indexOf('/huds/') + 6);
			name = segment.substr(0, segment.lastIndexOf('/'));
			hudIdentity.name = name;
		}

		socket.on("readyToRegister", () => {
			socket.emit("register", name, isDev, 'dota2');
		});
		socket.on(`hud_config`, (data: any) => {
			configs.save(data);
		});
		socket.on(`hud_action`, (data: any) => {
			actions.execute(data.action, data.data);
		});
		socket.on('keybindAction', (action: string) => {
			actions.execute(action);
		});

		socket.on("refreshHUD", () => {
			window.top.location.reload();
		});

		DOTA2.on('data', data => {
			this.setState({ game: data });
		})
		socket.on('match', () => {

			this.loadMatch(true);
		});

	}

	loadMatch = async (force = false) => {
		/*if (!dataLoader.match || force) {
			dataLoader.match = new Promise((resolve) => {
				api.match.getCurrent().then(match => {
					if (!match) {
						dataLoader.match = null;
						return;
					}
					this.setState({ match });

					let isReversed = false;
					if (GSI.last) {
						const mapName = GSI.last.map.name.substring(GSI.last.map.name.lastIndexOf('/') + 1);
						const current = match.vetos.filter(veto => veto.mapName === mapName)[0];
						if (current && current.reverseSide) {
							isReversed = true;
						}
						this.setState({ checked: true });
					}
					if (match.left.id) {
						api.teams.getOne(match.left.id).then(left => {
							const gsiTeamData = { id: left._id, name: left.name, country: left.country, logo: left.logo, map_score: match.left.wins, extra: left.extra };

							if (!isReversed) {
								GSI.teams.left = gsiTeamData;
							}
							else GSI.teams.right = gsiTeamData;
						});
					}
					if (match.right.id) {
						api.teams.getOne(match.right.id).then(right => {
							const gsiTeamData = { id: right._id, name: right.name, country: right.country, logo: right.logo, map_score: match.right.wins, extra: right.extra };

							if (!isReversed) GSI.teams.right = gsiTeamData;
							else GSI.teams.left = gsiTeamData;
						});
					}



				}).catch(() => {
					dataLoader.match = null;
				});
			});
		}*/
	}
	render() {
		if (!this.state.game) return '';
		return (
			<Layout game={this.state.game} />
		);
	}

}
export default App;
