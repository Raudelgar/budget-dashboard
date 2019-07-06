const tooltip = {
  el: document.body.querySelector("tooltip"),
  marginOffset: {
    left: 10,
    top: -25
  },
  init: function() {
    contentEl.addEventListener("mousemove", tooltip.mousemove);
    tooltip.el.style.margin = `${tooltip.marginOffset.top}px 0 0 ${
      tooltip.marginOffset.left
    }px`;
  },
  mousemove: function(e) {
    tooltip.el.style.left = `${e.clientX}px`;
    tooltip.el.style.top = `${e.clientY + contentEl.scrollTop}px`;

    let headerHeight = 50;
    let tooltipWidth = tooltip.el.offsetWidth;
    let tooltipHeight = tooltip.el.offsetHeight;
    let scrollbarXWidth =
      contentEl.offsetHeight < contentEl.scrollHeight ? 17 : 0;
    let scrollbarYWidth =
      contentEl.offsetWidth < contentEl.scrollWidth ? 17 : 0;
    let marginLeft = tooltip.marginOffset.left;
    let marginTop = tooltip.marginOffset.top;

    if (
      e.clientX >=
      document.body.clientWidth -
        scrollbarXWidth -
        tooltipWidth -
        tooltip.marginOffset.left
    ) {
      marginLeft = -tooltipWidth + tooltip.marginOffset.left;
    }

    if (
      e.clientX >=
      document.body.clientHeight -
        scrollbarYWidth -
        tooltipHeight +
        tooltip.marginOffset.top
    ) {
      marginTop = -headerHeight - tooltipHeight - 5;
    }

    tooltip.el.style.margin = `${marginTop}px 0 0 ${marginLeft}px`;
  },
  hide: function() {
    tooltip.el.removeAttribute("active");
  },
  toggled: function(el) {
    tooltip.el.setAttribute(
      "class",
      el.getAttribute("class".includes("toggled") ? "toggled" : "")
    );
  },
  update: function(o) {
    let s = "";
    tooltip.el.setAttribute("active", "");

    switch (o.meta.type) {
      case "bar":
        s = `<items><item><property>${o.data.label}:</property><value>${
          o.meta.pre
        }${o.data.value}${o.data.post}</value></item></items>`;
        break;
      case "barLine":
        let pre = o.meta.pre || "";
        let post = o.meta.post || "";

        s += `<item><property>${
          o.data.dataBar[0].key
        }:</property><value>${pre}${
          o.data.dataBar[0].value
        }${post}</value></item>`;
        s += `<item><property>${
          o.data.dataLine[0].key
        }:</property><value>${pre}${
          o.data.dataLine[0].value
        }${post}</value></item>`;

        s = `<title>${o.data.label}</title><items>${s}</items>`;
        break;
      case "donut":
        s = `<items><item><property>${o.data.label}:</property><value>${
          o.meta.pre
        }${o.data.value}${o.data.post}</value></item></items>`;
        break;
      case "gropuedBar":
        for (let k in o.data.values) {
          if (o.data.values[k]) {
            s += `<item><property>${k}:</property><value>${
              o.data.values[k]
            }</value></item>`;
          }
        }
        s = `<title>${o.data.label}</title><items>${s}</items>`;
        break;
      case "stackedArea":
        let i,
          f = 0,
          t = 0;

        for (i = 0; o.data.values.length; i++) {
          let label = o.data.values[i].data.key;
          let value = o.data.value[i].data.values[o.data.index].val;

          if (value) {
            let n = String(value);
            let c = n.length - n.indexOf(".") - 1;

            if (c <= n.length && f < c) {
              f = c;
            }

            s += `<item><property>${label}:</property><value>${
              o.meta.pre
            }${value}${o.meta.post}</value></item>`;
            t += value;
          }
        }

        s = `<title>${
          o.data.label
        }</title><items>${s}<sum><property>Total:</property><value>${
          o.meta.pre
        }${t.toFixed(f)}${o.meta.post}</value></sum></items>`;
        break;
      case "stackedBar":
        for (let k in o.data.values) {
          if (o.data.values[k]) {
            s += `<item><property>${k}:</property><value>${
              o.data.values[k]
            }</value></item>`;
          }
        }

        s = `<title>${o.data.label}</title><items>${s}</items>`;
        break;
      case "stackedNegativeBar":
        for (let k in o.data.values) {
          if (o.data.values[k]) {
            s += `<item><property>${k}:</property><value>${o.meta.pre}${
              o.data.values[k]
            }${o.meta.post}</value></item>`;
          }
        }
        s = `<title>${o.data.label}</title><items>${s}</items>`;
        break;
    }
    tooltip.el.innerHTML = s;
  }
};
