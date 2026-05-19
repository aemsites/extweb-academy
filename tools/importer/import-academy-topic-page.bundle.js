/* eslint-disable */
var CustomImportScript = (() => {
    var __defProp = Object.defineProperty;
    var __defProps = Object.defineProperties;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __getOwnPropSymbols = Object.getOwnPropertySymbols;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __propIsEnum = Object.prototype.propertyIsEnumerable;
    var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __spreadValues = (a, b) => {
      for (var prop in b || (b = {}))
        if (__hasOwnProp.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      if (__getOwnPropSymbols)
        for (var prop of __getOwnPropSymbols(b)) {
          if (__propIsEnum.call(b, prop))
            __defNormalProp(a, prop, b[prop]);
        }
      return a;
    };
    var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  
    // tools/importer/import-academy-topic-page.js
    var import_academy_topic_page_exports = {};
    __export(import_academy_topic_page_exports, {
      default: () => import_academy_topic_page_default
    });
  
    // tools/importer/parsers/breadcrumb.js
    function parse(element, { document }) {
      const block = WebImporter.Blocks.createBlock(document, {
        name: "Breadcrumb",
        cells: []
      });
      element.replaceWith(block);
    }
  
    // tools/importer/parsers/hero.js
    function parse2(element, { document }) {
      const heading = element.querySelector(".lp__heading_v1 h1, h1.h1, h1");
      const nextGridLayout = element.nextElementSibling;
      let image = null;
      if (nextGridLayout) {
        image = nextGridLayout.querySelector(".redesign_image .lp__image_components picture") || nextGridLayout.querySelector(".lp__image_components picture") || nextGridLayout.querySelector("picture") || nextGridLayout.querySelector("img");
      }
      if (!heading) {
        return;
      }
      const cells = [];
      if (image) {
        const imageCell = document.createDocumentFragment();
        imageCell.appendChild(document.createComment(" field:image "));
        imageCell.appendChild(image);
        cells.push([imageCell]);
      }
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      textCell.appendChild(heading);
      cells.push([textCell]);
      const block = WebImporter.Blocks.createBlock(document, { name: "hero", cells });
      element.replaceWith(block);
    }
  
    // tools/importer/parsers/cards.js
    function parse3(element, { document }) {
      const cardItems = element.querySelectorAll("li.lp__list_navigation_section");
      const cells = [];
      cardItems.forEach((card) => {
        const img = card.querySelector(".lp__lg_horizontal_img img");
        const imageCell = document.createDocumentFragment();
        imageCell.appendChild(document.createComment(" field:image "));
        if (img) {
          imageCell.appendChild(img);
        }
        const textCell = document.createDocumentFragment();
        textCell.appendChild(document.createComment(" field:text "));
        const titleLink = card.querySelector(".lp__list_navigation_title a");
        if (titleLink) {
          const h3 = document.createElement("h3");
          const link = document.createElement("a");
          link.href = titleLink.href;
          link.textContent = titleLink.textContent.trim();
          h3.appendChild(link);
          textCell.appendChild(h3);
        }
        const hammer = card.querySelector(".lp__hammer");
        if (hammer) {
          const subtitle = document.createElement("p");
          subtitle.textContent = hammer.textContent.trim();
          textCell.appendChild(subtitle);
        }
        const description = card.querySelector(".lp__blurb_text p");
        if (description) {
          textCell.appendChild(description);
        }
        cells.push([imageCell, textCell]);
      });
      const block = WebImporter.Blocks.createBlock(document, {
        name: "Cards (left-right-card)",
        cells
      });
      element.replaceWith(block);
    }
  
    // tools/importer/transformers/worldbank-cleanup.js
    var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
    function transform(hookName, element, payload) {
      if (hookName === TransformHook.beforeTransform) {
        WebImporter.DOMUtils.remove(element, ["#cookieconsentpopup"]);
        WebImporter.DOMUtils.remove(element, ["#destination_publishing_iframe_worldbank_0"]);
        WebImporter.DOMUtils.remove(element, ["#ZN_ahoepSezTqpB2GV"]);
        WebImporter.DOMUtils.remove(element, ["#fb-root"]);
      }
      if (hookName === TransformHook.afterTransform) {
        WebImporter.DOMUtils.remove(element, ["header"]);
        WebImporter.DOMUtils.remove(element, ["footer.footer-wrapper"]);
        WebImporter.DOMUtils.remove(element, [".acheader"]);
        WebImporter.DOMUtils.remove(element, [".wb_metadata"]);
        WebImporter.DOMUtils.remove(element, ["iframe", "link", "noscript"]);
      }
    }
  
    // tools/importer/transformers/worldbank-sections.js
    var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
    function transform2(hookName, element, payload) {
      if (hookName === TransformHook2.afterTransform) {
        const { template } = payload;
        if (!template || !template.sections || template.sections.length < 2) {
          return;
        }
        const document = element.ownerDocument;
        const sections = template.sections;
        for (let i = sections.length - 1; i >= 0; i--) {
          const section = sections[i];
          const sectionEl = element.querySelector(section.selector);
          if (!sectionEl) continue;
          if (section.style) {
            const sectionMetadata = WebImporter.Blocks.createBlock(document, {
              name: "Section Metadata",
              cells: { style: section.style }
            });
            sectionEl.parentNode.insertBefore(sectionMetadata, sectionEl.nextSibling);
          }
          if (i > 0) {
            const hr = document.createElement("hr");
            sectionEl.parentNode.insertBefore(hr, sectionEl);
          }
        }
      }
    }
  
    // tools/importer/import-academy-topic-page.js
    var parsers = {
      "breadcrumb": parse,
      "hero": parse2,
      "cards": parse3
    };
    var transformers = [
      transform,
      transform2
    ];
    var PAGE_TEMPLATE = {
      name: "academy-topic-page",
      description: "World Bank Academy topic page with hero banner and program listing cards",
      urls: [
        "https://academy.worldbank.org/en/prosperity/poverty"
      ],
      blocks: [
        {
          name: "breadcrumb",
          instances: [".lp__breadcrumb"]
        },
        {
          name: "hero",
          instances: [".supergrid .gridlayout:first-child"]
        },
        {
          name: "cards",
          instances: [".list_navigation"]
        }
      ],
      sections: [
        {
          id: "section-1",
          name: "Hero",
          selector: ".lang-toggler",
          style: "hero",
          blocks: ["breadcrumb", "hero"],
          defaultContent: []
        },
        {
          id: "section-2",
          name: "Poverty Practitioner Programs",
          selector: ".supergrid .gridlayout:nth-child(2)",
          style: "cards",
          blocks: ["cards"],
          defaultContent: [".lp__lead_lgtitle"]
        }
      ]
    };
    function executeTransformers(hookName, element, payload) {
      const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
        template: PAGE_TEMPLATE
      });
      transformers.forEach((transformerFn) => {
        try {
          transformerFn.call(null, hookName, element, enhancedPayload);
        } catch (e) {
          console.error(`Transformer failed at ${hookName}:`, e);
        }
      });
    }
    function findBlocksOnPage(document, template) {
      const pageBlocks = [];
      template.blocks.forEach((blockDef) => {
        blockDef.instances.forEach((selector) => {
          const elements = document.querySelectorAll(selector);
          elements.forEach((element) => {
            pageBlocks.push({
              name: blockDef.name,
              selector,
              element,
              section: blockDef.section || null
            });
          });
        });
      });
      return pageBlocks;
    }
    var import_academy_topic_page_default = {
      transform: (payload) => {
        const { document, url, html, params } = payload;
        const main = document.body;
        executeTransformers("beforeTransform", main, payload);
        const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
        pageBlocks.forEach((block) => {
          const parser = parsers[block.name];
          if (parser) {
            try {
              parser(block.element, { document, url, params });
            } catch (e) {
              console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
            }
          }
        });
        executeTransformers("afterTransform", main, payload);
        const hr = document.createElement("hr");
        main.appendChild(hr);
        WebImporter.rules.createMetadata(main, document);
        WebImporter.rules.transformBackgroundImages(main, document);
        WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
        const path = WebImporter.FileUtils.sanitizePath(
          new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
        );
        return [{
          element: main,
          path,
          report: {
            title: document.title,
            template: PAGE_TEMPLATE.name,
            blocks: pageBlocks.map((b) => b.name)
          }
        }];
      }
    };
    return __toCommonJS(import_academy_topic_page_exports);
  })();
  