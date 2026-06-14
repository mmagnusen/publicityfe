import { LoggedInNavigation } from "./LoggedInNavigation";
import { LoggedOutNavigation } from "./LoggedOutNavigation";

type NavigationProps = {
	isLoggedIn: boolean;
};

export function Navigation({ isLoggedIn }: NavigationProps) {
	if (isLoggedIn) {
		return <LoggedInNavigation />;
	}

	return <LoggedOutNavigation />;
}
