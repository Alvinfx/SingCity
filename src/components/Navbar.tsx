import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/components/Navbar.tsx");import { Link, useLocation } from "/node_modules/.vite/deps/react-router-dom.js?v=c2d236b7";
import { Button } from "/src/components/ui/button.tsx";
import { Mic2, Library, User, Wallet } from "/node_modules/.vite/deps/lucide-react.js?v=f687a3d2";
import { useWallet } from "/src/contexts/WalletContext.tsx";
var _jsxFileName = "/workspace/2eaeddb8-4078-4ad3-97e7-14b3524b6af4/src/components/Navbar.tsx";
import __vite__cjsImport4_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=29329065"; const _jsxDEV = __vite__cjsImport4_react_jsxDevRuntime["jsxDEV"];
var _s = $RefreshSig$();
export default function Navbar() {
	_s();
	const location = useLocation();
	const { walletConnected, walletAddress, connectWallet, disconnectWallet } = useWallet();
	const handleWalletClick = async () => {
		if (walletConnected) {
			disconnectWallet();
		} else {
			try {
				await connectWallet();
			} catch (error) {
				console.error("Error connecting wallet:", error);
				alert("Failed to connect wallet. Please try again.");
			}
		}
	};
	const isActive = (path) => location.pathname === path;
	return /* @__PURE__ */ _jsxDEV("nav", {
		"data-component-id": "src/components/Navbar.tsx:26:4",
		"data-component-name": "nav",
		className: "fixed top-0 left-0 right-0 z-50 bg-[#121212]/90 backdrop-blur-md border-b border-primary/20",
		children: /* @__PURE__ */ _jsxDEV("div", {
			"data-component-id": "src/components/Navbar.tsx:27:6",
			"data-component-name": "div",
			className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
			children: /* @__PURE__ */ _jsxDEV("div", {
				"data-component-id": "src/components/Navbar.tsx:28:8",
				"data-component-name": "div",
				className: "flex items-center justify-between h-16",
				children: [
					/* @__PURE__ */ _jsxDEV(Link, {
						to: "/",
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ _jsxDEV(Mic2, {
							"data-component-id": "src/components/Navbar.tsx:30:12",
							"data-component-name": "Mic2",
							className: "w-8 h-8 text-primary"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 30,
							columnNumber: 13
						}, this), /* @__PURE__ */ _jsxDEV("span", {
							"data-component-id": "src/components/Navbar.tsx:31:12",
							"data-component-name": "span",
							className: "text-2xl font-black tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent",
							children: "SingCity"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 31,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 29,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ _jsxDEV("div", {
						"data-component-id": "src/components/Navbar.tsx:36:10",
						"data-component-name": "div",
						className: "hidden md:flex items-center gap-6",
						children: [
							/* @__PURE__ */ _jsxDEV(Link, {
								to: "/karaoke",
								className: `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive("/karaoke") ? "bg-primary/20 text-primary" : "text-white/70 hover:text-white hover:bg-white/5"}`,
								children: [/* @__PURE__ */ _jsxDEV(Mic2, {
									"data-component-id": "src/components/Navbar.tsx:45:14",
									"data-component-name": "Mic2",
									className: "w-4 h-4"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 45,
									columnNumber: 15
								}, this), /* @__PURE__ */ _jsxDEV("span", {
									"data-component-id": "src/components/Navbar.tsx:46:14",
									"data-component-name": "span",
									children: "Sing"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 46,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 37,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ _jsxDEV(Link, {
								to: "/library",
								className: `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive("/library") ? "bg-primary/20 text-primary" : "text-white/70 hover:text-white hover:bg-white/5"}`,
								children: [/* @__PURE__ */ _jsxDEV(Library, {
									"data-component-id": "src/components/Navbar.tsx:56:14",
									"data-component-name": "Library",
									className: "w-4 h-4"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 56,
									columnNumber: 15
								}, this), /* @__PURE__ */ _jsxDEV("span", {
									"data-component-id": "src/components/Navbar.tsx:57:14",
									"data-component-name": "span",
									children: "Library"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 57,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 48,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ _jsxDEV(Link, {
								to: "/profile",
								className: `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive("/profile") ? "bg-primary/20 text-primary" : "text-white/70 hover:text-white hover:bg-white/5"}`,
								children: [/* @__PURE__ */ _jsxDEV(User, {
									"data-component-id": "src/components/Navbar.tsx:67:14",
									"data-component-name": "User",
									className: "w-4 h-4"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 67,
									columnNumber: 15
								}, this), /* @__PURE__ */ _jsxDEV("span", {
									"data-component-id": "src/components/Navbar.tsx:68:14",
									"data-component-name": "span",
									children: "Profile"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 68,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 59,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 36,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ _jsxDEV(Button, {
						"data-component-id": "src/components/Navbar.tsx:72:10",
						"data-component-name": "Button",
						onClick: handleWalletClick,
						className: `${walletConnected ? "bg-accent hover:bg-accent/90" : "bg-gradient-to-r from-primary to-accent hover:opacity-90"}`,
						children: [/* @__PURE__ */ _jsxDEV(Wallet, {
							"data-component-id": "src/components/Navbar.tsx:80:12",
							"data-component-name": "Wallet",
							className: "w-4 h-4 mr-2"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 80,
							columnNumber: 13
						}, this), walletConnected ? walletAddress : "Connect Wallet"]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 72,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 28,
				columnNumber: 9
			}, this)
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 27,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 26,
		columnNumber: 5
	}, this);
}
_s(Navbar, "iZubDJsJXuDeNXZsdojw5QYozhA=", false, function() {
	return [useLocation, useWallet];
});
_c = Navbar;
var _c;
$RefreshReg$(_c, "Navbar");
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
import * as __vite_react_currentExports from "/src/components/Navbar.tsx?t=1762766587047";
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }

  const currentExports = __vite_react_currentExports;
  queueMicrotask(() => {
    RefreshRuntime.registerExportsForReactRefresh("/workspace/2eaeddb8-4078-4ad3-97e7-14b3524b6af4/src/components/Navbar.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/workspace/2eaeddb8-4078-4ad3-97e7-14b3524b6af4/src/components/Navbar.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
function $RefreshReg$(type, id) { return RefreshRuntime.register(type, "/workspace/2eaeddb8-4078-4ad3-97e7-14b3524b6af4/src/components/Navbar.tsx" + ' ' + id); }
function $RefreshSig$() { return RefreshRuntime.createSignatureFunctionForTransform(); }

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxNQUFNLG1CQUFtQjtBQUNsQyxTQUFTLGNBQWM7QUFDdkIsU0FBUyxNQUFNLFNBQVMsTUFBTSxjQUFjO0FBQzVDLFNBQVMsaUJBQWlCOzs7O0FBRTFCLGVBQWUsU0FBUyxTQUFTOztDQUMvQixNQUFNLFdBQVcsYUFBYTtDQUM5QixNQUFNLEVBQUUsaUJBQWlCLGVBQWUsZUFBZSxxQkFBcUIsV0FBVztDQUV2RixNQUFNLG9CQUFvQixZQUFZO0FBQ3BDLE1BQUksaUJBQWlCO0FBQ25CLHFCQUFrQjtTQUNiO0FBQ0wsT0FBSTtBQUNGLFVBQU0sZUFBZTtZQUNkLE9BQU87QUFDZCxZQUFRLE1BQU0sNEJBQTRCLE1BQU07QUFDaEQsVUFBTSw4Q0FBOEM7Ozs7Q0FLMUQsTUFBTSxZQUFZLFNBQWlCLFNBQVMsYUFBYTtBQUV6RCxRQUNFLHdCQUFDO0VBQUU7RUFBQTtFQUFFLFdBQVU7WUFDYix3QkFBQztHQUFFO0dBQUE7R0FBRSxXQUFVO2FBQ2Isd0JBQUM7SUFBRTtJQUFBO0lBQUUsV0FBVTs7S0FDYix3QkFBQztNQUFLLElBQUc7TUFBSSxXQUFVO2lCQUNyQix3QkFBQztPQUFHO09BQUE7T0FBRSxXQUFVOzs7OztjQUF3QixFQUN4Qyx3QkFBQztPQUFHO09BQUE7T0FBRSxXQUFVO2lCQUEwRzs7Ozs7Y0FFcEg7Ozs7O2FBQ0Y7S0FFTix3QkFBQztNQUFFO01BQUE7TUFBRSxXQUFVOztPQUNiLHdCQUFDO1FBQ0MsSUFBRztRQUNILFdBQVcsK0RBQ1QsU0FBUyxXQUFXLEdBQ2hCLCtCQUNBO21CQUdOLHdCQUFDO1NBQUc7U0FBQTtTQUFFLFdBQVU7Ozs7O2dCQUFXLEVBQzNCLHdCQUFDO1NBQUc7U0FBQTttQkFBRTs7Ozs7Z0JBQVU7Ozs7O2VBQ1o7T0FDTix3QkFBQztRQUNDLElBQUc7UUFDSCxXQUFXLCtEQUNULFNBQVMsV0FBVyxHQUNoQiwrQkFDQTttQkFHTix3QkFBQztTQUFNO1NBQUE7U0FBRSxXQUFVOzs7OztnQkFBVyxFQUM5Qix3QkFBQztTQUFHO1NBQUE7bUJBQUU7Ozs7O2dCQUFhOzs7OztlQUNmO09BQ04sd0JBQUM7UUFDQyxJQUFHO1FBQ0gsV0FBVywrREFDVCxTQUFTLFdBQVcsR0FDaEIsK0JBQ0E7bUJBR04sd0JBQUM7U0FBRztTQUFBO1NBQUUsV0FBVTs7Ozs7Z0JBQVcsRUFDM0Isd0JBQUM7U0FBRztTQUFBO21CQUFFOzs7OztnQkFBYTs7Ozs7ZUFDZjs7Ozs7O2FBQ0g7S0FFTCx3QkFBQztNQUFLO01BQUE7TUFDSixTQUFTO01BQ1QsV0FBVyxHQUNULGtCQUNJLGlDQUNBO2lCQUdOLHdCQUFDO09BQUs7T0FBQTtPQUFFLFdBQVU7Ozs7O2NBQWdCLEVBQ2pDLGtCQUFrQixnQkFBZ0I7Ozs7O2FBQzdCOzs7Ozs7V0FDTDs7Ozs7VUFDRjs7Ozs7U0FDRiIsIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZXMiOlsiTmF2YmFyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMaW5rLCB1c2VMb2NhdGlvbiB9IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi91aS9idXR0b24nO1xuaW1wb3J0IHsgTWljMiwgTGlicmFyeSwgVXNlciwgV2FsbGV0IH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IHVzZVdhbGxldCB9IGZyb20gJ0AvY29udGV4dHMvV2FsbGV0Q29udGV4dCc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE5hdmJhcigpIHtcbiAgY29uc3QgbG9jYXRpb24gPSB1c2VMb2NhdGlvbigpO1xuICBjb25zdCB7IHdhbGxldENvbm5lY3RlZCwgd2FsbGV0QWRkcmVzcywgY29ubmVjdFdhbGxldCwgZGlzY29ubmVjdFdhbGxldCB9ID0gdXNlV2FsbGV0KCk7XG5cbiAgY29uc3QgaGFuZGxlV2FsbGV0Q2xpY2sgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKHdhbGxldENvbm5lY3RlZCkge1xuICAgICAgZGlzY29ubmVjdFdhbGxldCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBjb25uZWN0V2FsbGV0KCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjb25uZWN0aW5nIHdhbGxldDonLCBlcnJvcik7XG4gICAgICAgIGFsZXJ0KCdGYWlsZWQgdG8gY29ubmVjdCB3YWxsZXQuIFBsZWFzZSB0cnkgYWdhaW4uJyk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGlzQWN0aXZlID0gKHBhdGg6IHN0cmluZykgPT4gbG9jYXRpb24ucGF0aG5hbWUgPT09IHBhdGg7XG5cbiAgcmV0dXJuIChcbiAgICA8bmF2IGNsYXNzTmFtZT1cImZpeGVkIHRvcC0wIGxlZnQtMCByaWdodC0wIHotNTAgYmctWyMxMjEyMTJdLzkwIGJhY2tkcm9wLWJsdXItbWQgYm9yZGVyLWIgYm9yZGVyLXByaW1hcnkvMjBcIj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWF4LXctN3hsIG14LWF1dG8gcHgtNCBzbTpweC02IGxnOnB4LThcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gaC0xNlwiPlxuICAgICAgICAgIDxMaW5rIHRvPVwiL1wiIGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XG4gICAgICAgICAgICA8TWljMiBjbGFzc05hbWU9XCJ3LTggaC04IHRleHQtcHJpbWFyeVwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LTJ4bCBmb250LWJsYWNrIHRyYWNraW5nLXRpZ2h0IGJnLWdyYWRpZW50LXRvLXIgZnJvbS1wcmltYXJ5IHRvLWFjY2VudCBiZy1jbGlwLXRleHQgdGV4dC10cmFuc3BhcmVudFwiPlxuICAgICAgICAgICAgICBTaW5nQ2l0eVxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDwvTGluaz5cblxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaGlkZGVuIG1kOmZsZXggaXRlbXMtY2VudGVyIGdhcC02XCI+XG4gICAgICAgICAgICA8TGluayBcbiAgICAgICAgICAgICAgdG89XCIva2FyYW9rZVwiIFxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2BmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBweC00IHB5LTIgcm91bmRlZC1sZyB0cmFuc2l0aW9uLWFsbCAke1xuICAgICAgICAgICAgICAgIGlzQWN0aXZlKCcva2FyYW9rZScpIFxuICAgICAgICAgICAgICAgICAgPyAnYmctcHJpbWFyeS8yMCB0ZXh0LXByaW1hcnknIFxuICAgICAgICAgICAgICAgICAgOiAndGV4dC13aGl0ZS83MCBob3Zlcjp0ZXh0LXdoaXRlIGhvdmVyOmJnLXdoaXRlLzUnXG4gICAgICAgICAgICAgIH1gfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8TWljMiBjbGFzc05hbWU9XCJ3LTQgaC00XCIgLz5cbiAgICAgICAgICAgICAgPHNwYW4+U2luZzwvc3Bhbj5cbiAgICAgICAgICAgIDwvTGluaz5cbiAgICAgICAgICAgIDxMaW5rIFxuICAgICAgICAgICAgICB0bz1cIi9saWJyYXJ5XCIgXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17YGZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHB4LTQgcHktMiByb3VuZGVkLWxnIHRyYW5zaXRpb24tYWxsICR7XG4gICAgICAgICAgICAgICAgaXNBY3RpdmUoJy9saWJyYXJ5JykgXG4gICAgICAgICAgICAgICAgICA/ICdiZy1wcmltYXJ5LzIwIHRleHQtcHJpbWFyeScgXG4gICAgICAgICAgICAgICAgICA6ICd0ZXh0LXdoaXRlLzcwIGhvdmVyOnRleHQtd2hpdGUgaG92ZXI6Ymctd2hpdGUvNSdcbiAgICAgICAgICAgICAgfWB9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxMaWJyYXJ5IGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPlxuICAgICAgICAgICAgICA8c3Bhbj5MaWJyYXJ5PC9zcGFuPlxuICAgICAgICAgICAgPC9MaW5rPlxuICAgICAgICAgICAgPExpbmsgXG4gICAgICAgICAgICAgIHRvPVwiL3Byb2ZpbGVcIiBcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcHgtNCBweS0yIHJvdW5kZWQtbGcgdHJhbnNpdGlvbi1hbGwgJHtcbiAgICAgICAgICAgICAgICBpc0FjdGl2ZSgnL3Byb2ZpbGUnKSBcbiAgICAgICAgICAgICAgICAgID8gJ2JnLXByaW1hcnkvMjAgdGV4dC1wcmltYXJ5JyBcbiAgICAgICAgICAgICAgICAgIDogJ3RleHQtd2hpdGUvNzAgaG92ZXI6dGV4dC13aGl0ZSBob3ZlcjpiZy13aGl0ZS81J1xuICAgICAgICAgICAgICB9YH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPFVzZXIgY2xhc3NOYW1lPVwidy00IGgtNFwiIC8+XG4gICAgICAgICAgICAgIDxzcGFuPlByb2ZpbGU8L3NwYW4+XG4gICAgICAgICAgICA8L0xpbms+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8QnV0dG9uIFxuICAgICAgICAgICAgb25DbGljaz17aGFuZGxlV2FsbGV0Q2xpY2t9XG4gICAgICAgICAgICBjbGFzc05hbWU9e2Ake1xuICAgICAgICAgICAgICB3YWxsZXRDb25uZWN0ZWQgXG4gICAgICAgICAgICAgICAgPyAnYmctYWNjZW50IGhvdmVyOmJnLWFjY2VudC85MCcgXG4gICAgICAgICAgICAgICAgOiAnYmctZ3JhZGllbnQtdG8tciBmcm9tLXByaW1hcnkgdG8tYWNjZW50IGhvdmVyOm9wYWNpdHktOTAnXG4gICAgICAgICAgICB9YH1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8V2FsbGV0IGNsYXNzTmFtZT1cInctNCBoLTQgbXItMlwiIC8+XG4gICAgICAgICAgICB7d2FsbGV0Q29ubmVjdGVkID8gd2FsbGV0QWRkcmVzcyA6ICdDb25uZWN0IFdhbGxldCd9XG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9uYXY+XG4gICk7XG59XG4iXSwiZmlsZSI6Ii93b3Jrc3BhY2UvMmVhZWRkYjgtNDA3OC00YWQzLTk3ZTctMTRiMzUyNGI2YWY0L3NyYy9jb21wb25lbnRzL05hdmJhci50c3gifQ==