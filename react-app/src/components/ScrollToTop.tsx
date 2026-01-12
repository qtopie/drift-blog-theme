import { Button } from "@fluentui/react-components";
import { ArrowUp24Regular } from "@fluentui/react-icons";
import { useEffect, useState, useRef } from "react";

// React implementation of scroll-to-top button behavior.
// Shows the button after scrolling down, hides near the top, and
// animates opacity/visibility over ~200ms. Clicking smoothly scrolls to top.
export default function ScrollToTop({
	threshold = 200,
	durationMs = 200,
	id = "scrollToTopButton",
}: {
	threshold?: number;
	durationMs?: number;
	id?: string;
}) {
	const [visible, setVisible] = useState(false);
	const animTimeout = useRef<number | null>(null);
	const [animating, setAnimating] = useState<"show" | "hide" | null>(null);

	useEffect(() => {
		const onScroll = () => {
			const y = window.scrollY || document.documentElement.scrollTop || 0;
			const shouldShow = y > threshold;
			setVisible((prev) => {
				if (prev !== shouldShow) {
					setAnimating(shouldShow ? "show" : "hide");
					if (animTimeout.current) {
						window.clearTimeout(animTimeout.current);
					}
					animTimeout.current = window.setTimeout(() => {
						setAnimating(null);
					}, durationMs);
				}
				return shouldShow;
			});
		};

		// Initial check and listener
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", onScroll);
			if (animTimeout.current) window.clearTimeout(animTimeout.current);
		};
	}, [threshold, durationMs]);

	const scrollToTop = () => {
		// Mimic AMP top.scrollTo(duration=200)
		try {
			window.scrollTo({ top: 0, behavior: durationMs >= 200 ? "smooth" : "auto" });
		} catch {
			window.scrollTo(0, 0);
		}
	};

	// Base CSS is expected from theme: .scrollToTop { position: fixed; opacity: 0; visibility: hidden; ... }
	// We apply inline transition to mimic AMP animations for show/hide.
	const style: React.CSSProperties = {
		transition: `opacity ${durationMs}ms ease, visibility ${durationMs}ms step-end`,
		opacity: visible ? 1 : 0,
		visibility: visible ? "visible" : "hidden",
		// Prevent intercepting clicks when hidden (mobile layout safety)
		pointerEvents: visible ? "auto" : "none",
	};

	// Optional animation state hooks (could be used to add classNames if needed)
	const className = `scrollToTop` + (animating ? ` anim-${animating}` : "");

	return (
		<Button
			id={id}
			className={className}
			style={style}
			onClick={scrollToTop}
			aria-label="Scroll to Top"
			shape="circular"
			appearance="primary"
			size="large"
			icon={<ArrowUp24Regular />}
		/>
	);
}

