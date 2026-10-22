"use strict";

var BlsComparePageShopify = (function () {
  return {
    initCompareItems: function () {
      this.init();
    },

    init: function () {
      const compare_items = JSON.parse(
        localStorage.getItem("glozin__compare-items")
      );
      const compareDiv = document.querySelector(".compare-page-main");
      const div_no_product = compareDiv.querySelector(".compare-no-product-js");
      if (compare_items === null || compare_items.length === 0) {
        div_no_product.classList.remove("hidden");
      } else {
        var query = "";
        compare_items.forEach((e, key, compare_items) => {
          if (!Object.is(compare_items.length - 1, key)) {
            query += e + "%20OR%20id:";
          } else {
            query += e;
          }
        });
        const section_id = document.querySelector(".compare-page-section")
          .dataset.sectionId;
        var productAjaxURL =
          "?section_id=" +
          section_id +
          "&type=product&options[unavailable_products]=last&q=id:" +
          query;
        fetch(`${window.routes.search_url}${productAjaxURL}`)
          .then((response) => response.text())
          .then((responseText) => {
            const html = parser.parseFromString(responseText, "text/html");
            const table = compareDiv.querySelector(".compare-table");

            if (compare_items.length !== 0) {
              const bpc = html.querySelectorAll(
                ".compare-page-section > .product-compare"
              );
              if (bpc.length > 0) {
                // Each table row carries a `compare-row-<field>` class; append each
                // product's matching cell into it. Generic, so the spec rows
                // (capacity / zones / temperature / installation / dimensions /
                // noise / availability) work without being named here.
                const tableRows = table
                  ? table.querySelectorAll(".compare-row")
                  : [];
                if (table) {
                  table.classList.remove("hidden");
                  const exist_items = table.querySelectorAll(".compare-value");
                  exist_items.forEach((ei) => ei.remove());
                }
                bpc.forEach((el) => {
                  tableRows.forEach((rowEl) => {
                    const rowClass = Array.from(rowEl.classList).find(
                      (c) => c.indexOf("compare-row-") === 0
                    );
                    if (!rowClass) return;
                    const src = el.querySelector("." + rowClass);
                    if (src) rowEl.innerHTML += src.innerHTML;
                  });
                });
              } else {
                div_no_product.classList.remove("hidden");
              }
            }
          })
          .catch((e) => {
            console.error(e);
          })
          .finally((e) => {});
      }
    },
  };
})();
BlsComparePageShopify.initCompareItems();

class CompareRemove extends HTMLElement {
  constructor() {
    super();
    this.productId = this.dataset.productId;
    this.productHandle = this.dataset.productHandle;
    this.init();
  }
  init() {
    this.addEventListener("click", this.onThisClick.bind(this));
  }
  onThisClick() {
    const localListProductIds = localStorage.getItem("glozin__compare-items");
    const allThisProductIds = document.querySelectorAll(
      `compare-remove[data-product-id="${this.productId}"]`
    );
    let listProductIds = [];
    if (!this.productId) return;
    if (localListProductIds && allThisProductIds.length > 0) {
      // compare localstorage exists
      const parseLocalListProductIds = JSON.parse(localListProductIds);
      const indexOfProductId = parseLocalListProductIds.indexOf(
        this.productId
      );
      parseLocalListProductIds.splice(indexOfProductId, 1);
      listProductIds.push(...parseLocalListProductIds);
      const product_remove = document.querySelectorAll(
        `[data-product-handle="${this.productHandle}"]`
      );
      product_remove.forEach((e) => {
        e.remove();
      });
      if (JSON.parse(localListProductIds).length == 1) {
        const compareDiv = document.querySelector(".compare-page-main");
        const div_no_product = compareDiv.querySelector(".compare-no-product-js");
        const compare_table = compareDiv.querySelector(".compare-table");
        div_no_product.classList.remove("hidden");
        compare_table.remove();
      }
    }
    const stringifyListProductIds = JSON.stringify(listProductIds);
    localStorage.setItem("glozin__compare-items", stringifyListProductIds);
  }
}
customElements.define("compare-remove", CompareRemove);
