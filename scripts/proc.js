global.override.block(LogicBlock, {
	buildConfiguration(table) {
		let opened = false; // Whether the collapser is opened
		const buttons = table.table().get(); // Put all buttons in a nested table to fix spacing
		this.super$buildConfiguration(buttons); // Pass the button table

		const collapserButton = buttons.button(Icon.downOpen, Styles.clearTransi, () => {
			opened = !opened;
			collapserButton.style.imageUp = opened ? Icon.upOpen : Icon.downOpen;
		}).size(40).tooltip("vars").get();

		global.ldbTipNo("restart",
			buttons.button(Icon.rotate, Styles.clearTransi, () => {
				if (this.executor.vars[0] !== undefined) {
					this.executor.vars[0].numval = 0;
				}
			}).size(40)
		);

		global.ldbTipNo("reset",
		buttons.button(Icon.trash, Styles.clearTransi, () => {
				this.updateCode(this.code);
			}).size(40)
		);

		table.row();
		table.collapser(c => {
			c.background(Styles.black6).left().margin(10);
			for (let v of this.executor.vars) {
				// Only show the constant @unit
				if (!v.constant || v.name == "@unit") {
					c.label(this.ldbVarVal(v)).labelAlign(Align.left).fillX();
					c.row();
				}
			}
		}, false, () => opened).top().left().width(300).touchable(() => Touchable.disabled).self(c => c.height(c.get().getChildren().first().getPrefHeight())) // Match inner table's target height, prevent blocking clicks
	},

	ldbVarVal: v => () => {
		if (v.isobj) {
			if (typeof(v.objval) == "string") {
				return v.name + ': "' + v.objval + '"';
			}
			return v.name + ": " + v.objval;
		}

		return v.name + ": " + v.numval;
	},
});
