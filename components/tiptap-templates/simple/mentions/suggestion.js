import { computePosition, flip, shift } from "@floating-ui/dom";
import { posToDOMRect, ReactRenderer } from "@tiptap/react";
import { instanceAxios } from "@util/instanceAxios";

import MentionList from "./MentionList.jsx";

const getMentions = async (query, channelId) => {
	try {
		const params = { strSearchTerm: query };
		if (channelId != null) {
			params.channel_id = channelId;
		}
		const response = await instanceAxios.get("/users/public-users", {
			params,
		});
		return response.data.results.map((user) => {
			const fullName = [user.first_name, user.last_name]
				.filter(Boolean)
				.join(" ")
				.trim();
			return {
				id: user.pk,
				label: fullName || user.username || "",
				profile_image_url: user.human_profile?.profile_image_url ?? "",
			};
		});
	} catch (error) {
		console.error("Error fetching mentions:", error);
		return [];
	}
};
const updatePosition = (editor, element) => {
	const virtualElement = {
		getBoundingClientRect: () =>
			posToDOMRect(
				editor.view,
				editor.state.selection.from,
				editor.state.selection.to,
			),
	};

	computePosition(virtualElement, element, {
		placement: "bottom-start",
		strategy: "absolute",
		middleware: [shift(), flip()],
	}).then(({ x, y, strategy }) => {
		element.style.minWidth = "220px";
		element.style.width = "max-content";
		element.style.position = strategy;
		element.style.left = `${x}px`;
		element.style.top = `${y}px`;
	});
};

const createSuggestion = (channelId) => ({
	items: async ({ query }) => {
		const mentions = await getMentions(query, channelId);
		return mentions.slice(0, 5);
	},

	render: () => {
		let component;

		return {
			onStart: (props) => {
				component = new ReactRenderer(MentionList, {
					props,
					editor: props.editor,
				});

				if (!props.clientRect) {
					return;
				}

				component.element.style.position = "absolute";

				document.body.appendChild(component.element);

				updatePosition(props.editor, component.element);
			},

			onUpdate(props) {
				component.updateProps(props);

				if (!props.clientRect) {
					return;
				}

				updatePosition(props.editor, component.element);
			},

			onKeyDown(props) {
				if (props.event.key === "Escape") {
					component.destroy();

					return true;
				}

				return component.ref?.onKeyDown(props);
			},

			onExit() {
				component.element.remove();
				component.destroy();
			},
		};
	},
});

export default createSuggestion;
