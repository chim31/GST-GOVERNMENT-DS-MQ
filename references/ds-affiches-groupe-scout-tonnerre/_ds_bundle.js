/* @ds-bundle: {"format":4,"namespace":"GroupeScoutTonnerreDesignSystem_ad7474","components":[{"name":"Fleur","sourcePath":"components/brand/Fleur.jsx"},{"name":"HeaderBand","sourcePath":"components/brand/HeaderBand.jsx"},{"name":"PartnerRow","sourcePath":"components/brand/PartnerRow.jsx"},{"name":"SocialRail","sourcePath":"components/brand/SocialRail.jsx"},{"name":"BodyText","sourcePath":"components/content/BodyText.jsx"},{"name":"Countdown","sourcePath":"components/content/Countdown.jsx"},{"name":"GreetingBlock","sourcePath":"components/content/GreetingBlock.jsx"},{"name":"SpecSheet","sourcePath":"components/content/SpecSheet.jsx"},{"name":"TitleBlock","sourcePath":"components/content/TitleBlock.jsx"},{"name":"DataTag","sourcePath":"components/layout/DataTag.jsx"},{"name":"Divider","sourcePath":"components/layout/Divider.jsx"},{"name":"GridOverlay","sourcePath":"components/layout/GridOverlay.jsx"},{"name":"PosterFrame","sourcePath":"components/layout/PosterFrame.jsx"}],"sourceHashes":{"components/brand/Fleur.jsx":"9e82e9bf3b1b","components/brand/HeaderBand.jsx":"a179ddccc026","components/brand/PartnerRow.jsx":"ab653ef804fa","components/brand/SocialRail.jsx":"35cec4428b6c","components/content/BodyText.jsx":"42dc98523bd9","components/content/Countdown.jsx":"1664e8f6f28d","components/content/GreetingBlock.jsx":"bea2216358e8","components/content/SpecSheet.jsx":"0abaed12a7e2","components/content/TitleBlock.jsx":"b2b77972b32f","components/layout/DataTag.jsx":"0ddcd5bba87d","components/layout/Divider.jsx":"503ebab59d1b","components/layout/GridOverlay.jsx":"cb43800f8af3","components/layout/PosterFrame.jsx":"b539a80a1832"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.GroupeScoutTonnerreDesignSystem_ad7474 = window.GroupeScoutTonnerreDesignSystem_ad7474 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/Fleur.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Fleur de lys — motif scout universel, rendu à plat via le glyphe
   Unicode ⚜ (U+269C). Aucun logo dessiné : caractère typographique. */
function Fleur({
  size = 64,
  color = "var(--teal)",
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    "aria-hidden": "true",
    style: {
      display: "inline-block",
      fontFamily: "var(--font-serif)",
      fontSize: typeof size === "number" ? `${size}px` : size,
      lineHeight: 1,
      color,
      ...style
    }
  }, rest), "\u269C");
}
Object.assign(__ds_scope, { Fleur });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Fleur.jsx", error: String((e && e.message) || e) }); }

// components/brand/HeaderBand.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* HeaderBand — bandeau d'en-tête de marque, posé sur le cadre teal.
   Sur-mention association + nom du groupe + sous-mention ("vous présente"…).
   Variante collaboration : lignes org1 / connector / org principal. */
function HeaderBand({
  eyebrow = "Association Scoute du Togo",
  org = "Groupe Scout Tonnerre",
  submention = "vous présente",
  collaborator,
  // ex. "Le Groupe Scout Saint Pierre de Gounghin du Burkina Faso"
  connector = "en collaboration avec",
  closer,
  // ex. "organisent"
  tone = "light",
  // light (sur teal) | dark (sur panneau)
  align = "center",
  style,
  ...rest
}) {
  const base = tone === "dark" ? "var(--ink)" : "var(--white)";
  const faint = tone === "dark" ? "var(--ink-40)" : "rgba(255,255,255,0.8)";
  const alignItems = align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
  const eyebrowStyle = {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--fs-mono-sm)",
    letterSpacing: "var(--ls-eyebrow)",
    textTransform: "uppercase",
    color: faint,
    fontWeight: "var(--fw-medium)"
  };
  const smallCaps = {
    fontFamily: "var(--font-mono)",
    fontSize: "calc(var(--fs-mono-sm) - 3px)",
    letterSpacing: "0.24em",
    textTransform: "uppercase",
    color: faint,
    fontWeight: "var(--fw-regular)"
  };
  return /*#__PURE__*/React.createElement("header", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems,
      gap: "var(--space-2)",
      textAlign: align,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: eyebrowStyle
  }, eyebrow), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 42,
      height: "var(--hairline)",
      background: faint,
      opacity: 0.7
    }
  }), collaborator && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      ...smallCaps,
      fontWeight: "var(--fw-medium)",
      letterSpacing: "0.18em",
      marginTop: "var(--space-1)"
    }
  }, collaborator), /*#__PURE__*/React.createElement("div", {
    style: smallCaps
  }, connector)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--fs-display-md)",
      lineHeight: 1,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: base
    }
  }, org), (closer || submention) && /*#__PURE__*/React.createElement("div", {
    style: smallCaps
  }, closer || submention));
}
Object.assign(__ds_scope, { HeaderBand });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/HeaderBand.jsx", error: String((e && e.message) || e) }); }

// components/brand/PartnerRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* PartnerRow — ligne de badges partenaires + logo d'événement optionnel.
   Utilise le vrai visuel de badges extrait des affiches (assets/partner-badges.png). */
function PartnerRow({
  badgesSrc = "assets/partner-badges.png",
  height = 32,
  caption,
  logo,
  // node : logo/emblème d'événement à droite (ex. camp badge)
  align = "center",
  style,
  ...rest
}) {
  const badges = /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: align === "center" ? "center" : "flex-start",
      gap: "var(--space-2)"
    }
  }, badgesSrc && /*#__PURE__*/React.createElement("img", {
    src: badgesSrc,
    alt: "Partenaires scouts",
    style: {
      height,
      width: "auto",
      display: "block"
    }
  }), caption && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--fs-tag)",
      letterSpacing: "var(--ls-label)",
      textTransform: "uppercase",
      color: "var(--text-faint)"
    }
  }, caption));
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: logo ? "space-between" : align,
      gap: "var(--space-6)",
      width: "100%",
      ...style
    }
  }, rest), logo ? /*#__PURE__*/React.createElement("span", {
    style: {
      flex: "none",
      width: 1
    }
  }) : null, badges, logo && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "none"
    }
  }, logo));
}
Object.assign(__ds_scope, { PartnerRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/PartnerRow.jsx", error: String((e && e.message) || e) }); }

// components/brand/SocialRail.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* SocialRail — rail réseaux sociaux latéral, discret, sur le cadre teal.
   Pile d'icônes + poignée verticale (@). Icônes servies par Simple Icons CDN
   (marques standards des plateformes, pas de logo dessiné à la main). */
function SocialRail({
  platforms = ["facebook", "instagram", "youtube", "tiktok"],
  handle = "@groupesscouttonnerre",
  iconColor = "FFFFFF",
  iconSize = 22,
  gap = "var(--space-3)",
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "var(--space-5)",
      ...style
    }
  }, rest), handle && /*#__PURE__*/React.createElement("span", {
    style: {
      writingMode: "vertical-rl",
      transform: "rotate(180deg)",
      fontFamily: "var(--font-mono)",
      fontSize: "calc(var(--fs-tag) - 1px)",
      letterSpacing: "0.14em",
      color: "rgba(255,255,255,0.7)",
      whiteSpace: "nowrap"
    }
  }, handle), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap
    }
  }, platforms.map(p => /*#__PURE__*/React.createElement("img", {
    key: p,
    src: `https://cdn.simpleicons.org/${p}/${iconColor}`,
    alt: p,
    width: iconSize,
    height: iconSize,
    style: {
      display: "block",
      opacity: 0.92
    }
  }))));
}
Object.assign(__ds_scope, { SocialRail });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/SocialRail.jsx", error: String((e && e.message) || e) }); }

// components/content/BodyText.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* BodyText — bloc de texte descriptif, en serif lisible (EB Garamond).
   Note optionnelle façon "NB : …" en rouge italique. */
function BodyText({
  children,
  size = "md",
  color = "muted",
  maxWidth = "38ch",
  note,
  align = "left",
  style,
  ...rest
}) {
  const fs = size === "sm" ? "var(--fs-body-sm)" : "var(--fs-body)";
  const col = color === "ink" ? "var(--text-body)" : color === "muted" ? "var(--text-muted)" : color;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
      textAlign: align,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-serif)",
      fontSize: fs,
      lineHeight: "var(--lh-body)",
      color: col,
      maxWidth,
      textWrap: "pretty"
    }
  }, children), note && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-serif)",
      fontStyle: "italic",
      fontSize: "var(--fs-body-sm)",
      lineHeight: 1.4,
      color: "var(--red)",
      maxWidth
    }
  }, note));
}
Object.assign(__ds_scope, { BodyText });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/BodyText.jsx", error: String((e && e.message) || e) }); }

// components/content/Countdown.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Countdown — variante compte à rebours / date limite.
   Chiffres très gros (Bebas), minimal. Ex. "JJ - 10". */
function Countdown({
  kicker,
  // ex. "Fin des inscriptions" (rouge)
  date,
  // ex. "30 juillet 2026" (mono)
  prefix = "JJ -",
  // ex. "JJ -" ou "J-"
  value,
  // ex. "10"
  color = "ink",
  align = "left",
  style,
  ...rest
}) {
  const bigColor = color === "red" ? "var(--red)" : color === "teal" ? "var(--teal)" : "var(--ink)";
  const items = align === "center" ? "center" : "flex-start";
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: items,
      textAlign: align,
      gap: "var(--space-4)",
      ...style
    }
  }, rest), kicker && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--fs-display-lg)",
      lineHeight: 0.9,
      letterSpacing: "0.01em",
      textTransform: "uppercase",
      color: "var(--red)"
    }
  }, kicker), date && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--fs-mono)",
      fontWeight: "var(--fw-semibold)",
      letterSpacing: "var(--ls-label)",
      textTransform: "uppercase",
      color: "var(--text-body)"
    }
  }, date), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: "0.3em",
      fontFamily: "var(--font-display)",
      fontSize: "var(--fs-display-2xl)",
      lineHeight: 0.82,
      letterSpacing: "0.01em",
      color: bigColor
    }
  }, /*#__PURE__*/React.createElement("span", null, prefix), /*#__PURE__*/React.createElement("span", null, value)));
}
Object.assign(__ds_scope, { Countdown });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Countdown.jsx", error: String((e && e.message) || e) }); }

// components/content/GreetingBlock.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* GreetingBlock — variante vœux / félicitations, plus douce, moins de data.
   Amorce en serif italique (EB Garamond, remplace le script "Canva"),
   mot fort en Bebas, message serif optionnel, ornement fleur. */
function GreetingBlock({
  lead,
  // ex. "Bonne fête de" (serif italique)
  highlight,
  // ex. "Tabaski" (Bebas)
  message,
  // ex. "Travaillez avec confiance, réussissez avec fierté !"
  highlightColor = "ink",
  fleur = true,
  align = "center",
  style,
  ...rest
}) {
  const hc = highlightColor === "red" ? "var(--red)" : highlightColor === "teal" ? "var(--teal)" : "var(--text-body)";
  const items = align === "center" ? "center" : "flex-start";
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: items,
      textAlign: align,
      gap: "var(--space-4)",
      ...style
    }
  }, rest), fleur && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      fontFamily: "var(--font-serif)",
      fontSize: 52,
      lineHeight: 1,
      color: "var(--teal)"
    }
  }, "\u269C"), lead && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-serif)",
      fontStyle: "italic",
      fontSize: "var(--fs-serif-xl)",
      lineHeight: 1.05,
      color: "var(--text-muted)"
    }
  }, lead), highlight && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--fs-display-xl)",
      lineHeight: 0.9,
      letterSpacing: "0.02em",
      textTransform: "uppercase",
      color: hc
    }
  }, highlight), message && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      marginTop: "var(--space-2)",
      fontFamily: "var(--font-serif)",
      fontSize: "var(--fs-body)",
      lineHeight: "var(--lh-body)",
      color: "var(--text-muted)",
      maxWidth: "30ch",
      textWrap: "pretty"
    }
  }, message));
}
Object.assign(__ds_scope, { GreetingBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/GreetingBlock.jsx", error: String((e && e.message) || e) }); }

// components/content/SpecSheet.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* SpecSheet — bloc "infos pratiques" façon fiche technique, en mono.
   items: [{ label, value, index? }]. Layouts : stack | inline | cards. */
function SpecSheet({
  items = [],
  layout = "stack",
  style,
  ...rest
}) {
  const labelStyle = {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--fs-mono-sm)",
    letterSpacing: "var(--ls-label)",
    textTransform: "uppercase",
    color: "var(--text-faint)",
    fontWeight: "var(--fw-medium)"
  };
  const valueStyle = {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--fs-mono)",
    letterSpacing: "var(--ls-mono)",
    color: "var(--text-body)",
    fontWeight: "var(--fw-semibold)"
  };
  if (layout === "inline") {
    return /*#__PURE__*/React.createElement("div", _extends({
      style: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "baseline",
        gap: "var(--space-2) var(--space-4)",
        ...style
      }
    }, rest), items.map((it, i) => /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, i > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-faint)",
        fontFamily: "var(--font-mono)"
      }
    }, "|"), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "baseline",
        gap: "0.5em"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: labelStyle
    }, it.label), /*#__PURE__*/React.createElement("span", {
      style: valueStyle
    }, it.value)))));
  }
  if (layout === "cards") {
    return /*#__PURE__*/React.createElement("div", _extends({
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--space-5)",
        ...style
      }
    }, rest), items.map((it, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...labelStyle,
        color: "var(--text-muted)"
      }
    }, it.label), /*#__PURE__*/React.createElement("div", {
      style: {
        border: "var(--border-weight) solid var(--teal)",
        padding: "var(--space-3) var(--space-4)",
        display: "inline-flex"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...valueStyle,
        fontSize: "var(--fs-mono)"
      }
    }, it.value)))));
  }

  // stack (défaut) : lignes label → valeur, colonne label alignée
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)",
      ...style
    }
  }, rest), items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "grid",
      gridTemplateColumns: "minmax(120px, max-content) 1fr",
      columnGap: "var(--space-5)",
      alignItems: "baseline"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: labelStyle
  }, it.index ? it.index + " " : "", it.label), /*#__PURE__*/React.createElement("span", {
    style: valueStyle
  }, it.value))));
}
Object.assign(__ds_scope, { SpecSheet });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/SpecSheet.jsx", error: String((e && e.message) || e) }); }

// components/content/TitleBlock.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const COLORS = {
  red: "var(--red)",
  ink: "var(--ink)",
  teal: "var(--teal)",
  white: "var(--white)"
};
const SIZES = {
  xl: "var(--fs-display-xl)",
  lg: "var(--fs-display-lg)",
  md: "var(--fs-display-md)"
};

/* TitleBlock — bloc titre principal : sur-titre (mono/ink) + gros titre
   condensé Bebas, avec sous-titre serif italique optionnel. */
function TitleBlock({
  eyebrow,
  title,
  subtitle,
  color = "red",
  size = "xl",
  align = "left",
  fleur = false,
  style,
  ...rest
}) {
  const items = align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: items,
      textAlign: align,
      gap: "var(--space-3)",
      ...style
    }
  }, rest), fleur && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      fontFamily: "var(--font-serif)",
      fontSize: 40,
      lineHeight: 1,
      color: "var(--teal)"
    }
  }, "\u269C"), eyebrow && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--fs-mono)",
      fontWeight: "var(--fw-semibold)",
      letterSpacing: "var(--ls-mono)",
      textTransform: "uppercase",
      color: "var(--text-body)"
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: SIZES[size] || SIZES.xl,
      lineHeight: "var(--lh-display)",
      letterSpacing: "var(--ls-display)",
      textTransform: "uppercase",
      color: COLORS[color] || COLORS.red,
      whiteSpace: "pre-line",
      textWrap: "balance"
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-serif)",
      fontStyle: "italic",
      fontSize: "var(--fs-serif-lg)",
      lineHeight: 1.15,
      color: "var(--text-muted)",
      maxWidth: "24ch"
    }
  }, subtitle));
}
Object.assign(__ds_scope, { TitleBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/TitleBlock.jsx", error: String((e && e.message) || e) }); }

// components/layout/DataTag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Monospace grid marker — ".01 / SPÉCIFICATION" style tag posed along
   grid borders. Traité comme une donnée technique. */
function DataTag({
  index,
  label,
  tone = "auto",
  style,
  ...rest
}) {
  const color = tone === "red" ? "var(--red)" : "var(--tag)";
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5em",
      fontFamily: "var(--font-mono)",
      fontSize: "var(--fs-tag)",
      fontWeight: "var(--fw-medium)",
      letterSpacing: "var(--ls-tag)",
      textTransform: "uppercase",
      color,
      ...style
    }
  }, rest), index != null && /*#__PURE__*/React.createElement("span", null, index), index != null && label != null && /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.5
    }
  }, "/"), label != null && /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { DataTag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/DataTag.jsx", error: String((e && e.message) || e) }); }

// components/layout/Divider.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Editorial rule — filet rouge de séparation, avec tag mono optionnel.
   Reprend le filet rouge des affiches "Journée de la Bonne Action". */
function Divider({
  width = 220,
  weight,
  color = "var(--rule)",
  tag,
  tagIndex,
  align = "left",
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
      gap: "var(--space-3)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      width: typeof width === "number" ? `${width}px` : width,
      height: weight || "var(--rule-weight)",
      background: color
    }
  }), (tag || tagIndex) && /*#__PURE__*/React.createElement(__ds_scope.DataTag, {
    index: tagIndex,
    label: tag
  }));
}
Object.assign(__ds_scope, { Divider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/Divider.jsx", error: String((e && e.message) || e) }); }

// components/layout/GridOverlay.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Hairline composition grid — thin intersecting lines with optional
   crosshair nodes at the intersections. Esprit Longbow : structure
   technique discrète posée par-dessus la composition. */
function GridOverlay({
  cols = 3,
  rows = 3,
  nodes = true,
  inset = 0,
  color,
  nodeColor,
  style,
  ...rest
}) {
  const line = color || "var(--line-on-white)";
  const node = nodeColor || "var(--node-on-white)";
  const vLines = Array.from({
    length: cols - 1
  }, (_, i) => (i + 1) / cols * 100);
  const hLines = Array.from({
    length: rows - 1
  }, (_, i) => (i + 1) / rows * 100);
  const wrap = {
    position: "absolute",
    inset: typeof inset === "number" ? `${inset}px` : inset,
    pointerEvents: "none",
    zIndex: 0,
    ...style
  };
  const nodeSize = "var(--node-size)";
  return /*#__PURE__*/React.createElement("div", _extends({
    "aria-hidden": "true",
    style: wrap
  }, rest), vLines.map(p => /*#__PURE__*/React.createElement("div", {
    key: "v" + p,
    style: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: p + "%",
      width: "var(--hairline)",
      background: line
    }
  })), hLines.map(p => /*#__PURE__*/React.createElement("div", {
    key: "h" + p,
    style: {
      position: "absolute",
      left: 0,
      right: 0,
      top: p + "%",
      height: "var(--hairline)",
      background: line
    }
  })), nodes && vLines.map(x => hLines.map(y => /*#__PURE__*/React.createElement("div", {
    key: "n" + x + "-" + y,
    style: {
      position: "absolute",
      left: x + "%",
      top: y + "%",
      width: nodeSize,
      height: nodeSize,
      transform: "translate(-50%,-50%)",
      borderTop: `var(--hairline) solid ${node}`,
      borderLeft: `var(--hairline) solid ${node}`,
      borderRight: `var(--hairline) solid ${node}`,
      borderBottom: `var(--hairline) solid ${node}`,
      boxSizing: "border-box",
      background: "transparent"
    }
  }))));
}
Object.assign(__ds_scope, { GridOverlay });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/GridOverlay.jsx", error: String((e && e.message) || e) }); }

// components/layout/PosterFrame.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* PosterFrame — cadre carré 1080×1080 de la marque.
   Bordure teal extérieure + panneau de contenu (blanc / écru / teal),
   avec emplacements pour le bandeau d'en-tête, le rail réseaux et le pied. */
function PosterFrame({
  tone = "white",
  // panneau : white | cream | teal
  inset = true,
  // panneau posé en carte avec marge teal visible
  grid = false,
  // grille hairline dans le panneau
  gridCols = 3,
  gridRows = 3,
  header,
  rail,
  footer,
  size = "var(--poster-size)",
  children,
  className,
  style,
  ...rest
}) {
  const panelBg = tone === "cream" ? "var(--bg-panel-alt)" : tone === "teal" ? "var(--bg-invert)" : "var(--bg-panel)";
  const onTeal = tone === "teal";
  const root = {
    position: "relative",
    width: size,
    height: size,
    background: "var(--bg-frame)",
    boxSizing: "border-box",
    padding: "var(--frame-pad)",
    display: "flex",
    flexDirection: "column",
    fontFamily: "var(--font-serif)",
    color: "var(--text-body)",
    overflow: "hidden",
    ...style
  };
  const stack = {
    position: "relative",
    zIndex: 1,
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    // laisse la place au rail à droite
    paddingRight: "var(--rail-width)"
  };
  const panel = {
    position: "relative",
    flex: 1,
    minHeight: 0,
    background: panelBg,
    boxSizing: "border-box",
    padding: "var(--panel-pad)",
    marginTop: header ? "var(--space-6)" : 0,
    display: "flex",
    flexDirection: "column",
    ...(inset ? {} : {
      margin: 0
    })
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    className: [onTeal ? "gst-on-teal" : "", className].filter(Boolean).join(" "),
    style: root
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: stack
  }, header && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "none"
    }
  }, header), /*#__PURE__*/React.createElement("div", {
    className: onTeal ? "" : "",
    style: panel
  }, grid && /*#__PURE__*/React.createElement(__ds_scope.GridOverlay, {
    cols: gridCols,
    rows: gridRows,
    inset: 0
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 1,
      flex: 1,
      minHeight: 0,
      display: "flex",
      flexDirection: "column"
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 1,
      flex: "none",
      marginTop: "var(--space-6)"
    }
  }, footer))), rail && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 0,
      right: 0,
      height: "100%",
      width: "var(--frame-pad)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2
    }
  }, rail));
}
Object.assign(__ds_scope, { PosterFrame });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/PosterFrame.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Fleur = __ds_scope.Fleur;

__ds_ns.HeaderBand = __ds_scope.HeaderBand;

__ds_ns.PartnerRow = __ds_scope.PartnerRow;

__ds_ns.SocialRail = __ds_scope.SocialRail;

__ds_ns.BodyText = __ds_scope.BodyText;

__ds_ns.Countdown = __ds_scope.Countdown;

__ds_ns.GreetingBlock = __ds_scope.GreetingBlock;

__ds_ns.SpecSheet = __ds_scope.SpecSheet;

__ds_ns.TitleBlock = __ds_scope.TitleBlock;

__ds_ns.DataTag = __ds_scope.DataTag;

__ds_ns.Divider = __ds_scope.Divider;

__ds_ns.GridOverlay = __ds_scope.GridOverlay;

__ds_ns.PosterFrame = __ds_scope.PosterFrame;

})();
