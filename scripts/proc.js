global.override.block(LogicBlock, {
	buildConfiguration(table) {
		this.super$buildConfiguration(table);
		// Remove long black bar due to collapser
		table.background(null);

		const editBtn = table.cells.get(0).get();
		table.clearChildren();

		table.table(null, table => {
			table.add(editBtn).size(40);

			const button = table.button(Icon.downOpen, Styles.clearTransi, () => {
				this.ldbCollapser.toggle();
				button.style.imageUp = this.ldbCollapser.collapsed ? Icon.downOpen : Icon.upOpen;
			}).size(40).center().tooltip("vars").get();

			global.ldbTipNo("restart",
				table.button(Icon.rotate, Styles.clearTransi, () => this.executor.vars[0].numval = 0)
					.size(40).center()
			);

			global.ldbTipNo("reset",
				table.button(Icon.trash, Styles.clearTransi, () => {
					this.updateCode(this.code);
					let collapsed = this.ldbCollapser.isCollapsed();
					this.ldbBuildVariables();
					cell.setElement(this.ldbCollapser).get().setCollapsed(collapsed);
				}).size(40).center()
			);
		}).center();
		table.row();

		this.ldbBuildVariables();
		const cell = table.add(this.ldbCollapser).size(300, 600).bottom();
	},

	ldbBuildVariables() {
		this.ldbCollapser = new Collapser(table => {
			const back = new BaseDrawable(Styles.none);
			back.minHeight = 1000;
			table.background(back);

			const p = table.pane(tableInPane => {
				tableInPane.left().top().margin(10);
				tableInPane.background(Styles.black6);
				for (var v of this.executor.vars) {
					// Only show the constant @unit
					if (!v.constant || v.name == "@unit") {
						tableInPane.label(this.ldbVarVal(v)).padLeft(10).left().get().alignment = Align.left;
						tableInPane.row();
					}
				}
			}).grow().left().margin(10).pad(10).get();
			p.setOverscroll(false, false);
			p.setSmoothScrolling(false);
		}, true);
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

	ldbCollapser: null
});
