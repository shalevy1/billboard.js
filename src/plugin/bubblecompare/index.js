import {select as d3Select} from "d3-selection";
import Plugin from "../Plugin";

/**
 * Bubble compare diagram plugin.<br>
 * Compare data 3-dimensional ways: x-axis, y-axis & bubble-size.
 * - **NOTE:**
 *   - Plugins aren't built-in. Need to be loaded or imported to be used.
 * @class plugin-bubblecompare
 * @param {Object} options bubble compare plugin options
 * @extends Plugin
 * @return {BubbleCompare}
 * @example
 *  var chart = bb.generate({
 *     data: {
 *        columns: [ ... ],
 *        type: "bubble"
 *     }
 *     ...
 *     plugins: [
 *        new bb.plugin.bubblecompare({
 *          minR: 11,
 *          maxR: 74,
 *          expandScale: 1.1
 *        }),
 *     ]
 *  });
 */

export default class BubbleCompare extends Plugin {
	static version = `0.0.1`;

	constructor(options) {
		super(options);

		return this;
	}

	$init() {
		const {$$} = this;

		$$.findClosest = this.findClosest.bind(this);
		$$.getBubbleR = this.getBubbleR.bind(this);
		$$.pointExpandedR = this.pointExpandedR.bind(this);
	}

	pointExpandedR(d) {
		const baseR = this.getBubbleR(d);
		const {expandScale = 1} = this.options;

		BubbleCompare.raiseFocusedBubbleLayer(d);
		this.changeCursorPoint();

		return baseR * expandScale;
	}

	static raiseFocusedBubbleLayer(d) {
		d.raise && d3Select(d.node().parentNode.parentNode).raise();
	}

	changeCursorPoint() {
		this.$$.svg.select(`.bb-event-rect`).style("cursor", "pointer");
	}

	findClosest(values, pos) {
		const {$$} = this;

		return values
			.filter(v => v && !$$.isBarType(v.id))
			.reduce((acc, cur) => {
				const d = $$.dist(cur, pos);

				return d < this.getBubbleR(cur) ? cur : acc;
			}, 0);
	}

	getBubbleR(d) {
		const {minR, maxR} = this.options;
		const curVal = this.getZData(d);

		if (!curVal) return minR;

		const [min, max] = this.$$.data.targets.reduce(
			([accMin, accMax], cur) => {
				const val = this.getZData(cur.values[0]);

				return [Math.min(accMin, val), Math.max(accMax, val)];
			},
			[10000, 0]
		);
		const size = min > 0 && max === min ? 0 : curVal / max;

		return Math.abs(size) * (maxR - minR) + minR;
	}

	getZData(d) {
		return this.$$.isBubbleZType(d) ?
			this.$$.getBubbleZData(d.value, "z") :
			d.value;
	}
}
