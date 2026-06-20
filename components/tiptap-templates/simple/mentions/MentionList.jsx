import React, { useEffect, useImperativeHandle, useState } from "react";

const MentionList = (props) => {
	const [selectedIndex, setSelectedIndex] = useState(0);

	const selectItem = (index) => {
		const item = props.items[index];

		if (item) {
			props.command({ id: item.id, label: item.label });
		}
	};

	const upHandler = () => {
		setSelectedIndex(
			(selectedIndex + props.items.length - 1) % props.items.length,
		);
	};

	const downHandler = () => {
		setSelectedIndex((selectedIndex + 1) % props.items.length);
	};

	const enterHandler = () => {
		selectItem(selectedIndex);
	};

	useEffect(() => setSelectedIndex(0), [props.items]);

	useImperativeHandle(props.ref, () => ({
		onKeyDown: ({ event }) => {
			if (event.key === "ArrowUp") {
				upHandler();
				return true;
			}

			if (event.key === "ArrowDown") {
				downHandler();
				return true;
			}

			if (event.key === "Enter") {
				enterHandler();
				return true;
			}

			return false;
		},
	}));

	const profileInitial = (item) =>
		(item.label || `User ${item.id}`).trim().charAt(0).toUpperCase() || "?";

	return (
		<div className="dropdown-menu mention-list">
			{props.items.length ? (
				props.items.map((item, index) => (
					<button
						className={index === selectedIndex ? "is-selected" : ""}
						key={item.id}
						onClick={() => selectItem(index)}
						type="button"
					>
						<span className="mention-list__avatar">{profileInitial(item)}</span>
						<span className="mention-list__label">
							{item.label || `User ${item.id}`}
						</span>
					</button>
				))
			) : (
				<div className="item">No result</div>
			)}
		</div>
	);
};

export default MentionList;
