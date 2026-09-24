"use client";

import { useEffect, useMemo, useState } from "react";
import type { RiceMenu, Meal } from "@/lib/rice-dining";
import { demoMenus } from "@/lib/rice-dining";

type Filter = "All" | "Vegan" | "Vegetarian" | "Halal" | "GF";

const serveries = ["North", "West", "South", "Baker", "Seibel", "South Main"];

const filterMap: Record<Filter, string[]> = {
  All: [],
  Vegan: ["VG"],
  Vegetarian: ["V", "VG"],
  Halal: ["H"],
  GF: ["GF"]
};

function ArrowIcon() {
  return <span aria-hidden="true" className="arrow-icon">↗</span>;
}

export default function Home() {
  const [meal, setMeal] = useState<Meal>("Dinner");
  const [menus, setMenus] = useState<RiceMenu>(demoMenus);
  const [menuStatus, setMenuStatus] = useState<"demo" | "live">("demo");
  const [servery, setServery] = useState("North");
  const [filter, setFilter] = useState<Filter>("All");
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    fetch("/api/menu")
      .then((response) => response.json())
      .then((result: { menus: RiceMenu; live: boolean }) => {
        setMenus(result.menus);
        setMenuStatus(result.live ? "live" : "demo");
      })
      .catch(() => setMenuStatus("demo"));
  }, []);

  const featured = menus[meal][servery] ?? [];
  const matched = useMemo(() => {
    const required = filterMap[filter];
    if (!required.length) return featured;
    return featured.filter((item) => required.some((tag) => (item.tags as readonly string[]).includes(tag)));
  }, [featured, filter]);

  return (
    <main className="app-shell">
      <nav className="topbar">
        <a className="wordmark" href="#" aria-label="OwlEats home">
          <span className="wordmark-mark">✦</span>
          OwlEats
        </a>
        <div className="topbar-actions">
          <span className="demo-pill"><span className="status-dot" />{menuStatus === "live" ? "Live Rice Dining menu" : "Demo menu · source unavailable"}</span>
          <button className="profile-button" onClick={() => setShowSetup(true)} aria-label="Open preferences">
            <span className="avatar">MC</span><span className="profile-name">Mika&apos;s setup</span><span className="chevron">⌄</span>
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Your dining day, edited</p>
          <h1>Know what&apos;s<br /><em>worth the walk.</em></h1>
          <p className="hero-description">A quick read on what&apos;s cooking at Rice, matched to the way you eat.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}>See tonight&apos;s picks <ArrowIcon /></button>
            <button className="text-button" onClick={() => setShowSetup(true)}>Edit my preferences <span>→</span></button>
          </div>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <div className="orbit-ring ring-one" />
          <div className="orbit-ring ring-two" />
          <div className="orbit-card">
            <span className="orbit-star">✦</span>
            <strong>North</strong>
            <span>7 min walk</span>
          </div>
          <div className="orbit-note">Tonight<br /><b>5:30 PM</b></div>
        </div>
      </section>

      <section className="quick-strip" aria-label="Today at a glance">
        <div className="quick-label">Today at a glance</div>
        <div className="quick-item"><span className="quick-icon sun">☼</span><div><b>72°</b><span>clear skies</span></div></div>
        <div className="quick-item"><span className="quick-icon walk">↗</span><div><b>7 min</b><span>to North</span></div></div>
        <div className="quick-item"><span className="quick-icon event">✦</span><div><b>1 special</b><span>event tonight</span></div></div>
        <div className="quick-spacer" />
        <button className="manage-button" onClick={() => setShowSetup(true)}>Manage alerts <ArrowIcon /></button>
      </section>

      <section id="menu" className="menu-section">
        <div className="section-heading">
          <div><p className="eyebrow">Curated for you</p><h2>What should I eat <em>now?</em></h2></div>
          <div className="meal-toggle" role="group" aria-label="Meal period">
            {(["Lunch", "Dinner"] as Meal[]).map((option) => <button key={option} className={meal === option ? "active" : ""} onClick={() => setMeal(option)}>{option}<span>{option === "Lunch" ? "11:00–2:00" : "5:00–8:00"}</span></button>)}
          </div>
        </div>

        <div className="menu-layout">
          <div className="menu-main">
            <div className="menu-context">
              <div><span className="context-dot" />Showing your saved servery first</div>
              <div className="filters">{(["All", "Vegan", "Vegetarian", "Halal", "GF"] as Filter[]).map((option) => <button key={option} className={filter === option ? "selected" : ""} onClick={() => setFilter(option)}>{option === "GF" ? "Gluten-free" : option}</button>)}</div>
            </div>
            <div className="servery-tabs">{serveries.map((name) => <button key={name} className={servery === name ? "current" : ""} onClick={() => setServery(name)}>{name}<span>{name === "North" ? "★" : "·"}</span></button>)}</div>
            <div className="featured-panel">
              <div className="featured-top"><div><span className="featured-kicker">Your saved spot</span><h3>{servery} Servery</h3></div><span className="walk-badge">7 min walk ↗</span></div>
              <div className="dish-list">
                {matched.length ? matched.map((item, index) => <div className="dish-row" key={`${item.name}-${index}`}><span className={`dish-swatch ${item.tone}`} /><div className="dish-info"><b>{item.name}</b><span>{item.note}</span></div><div className="tag-list">{item.tags.map((tag, tagIndex) => <span key={`${tag}-${tagIndex}`} className={`diet-tag ${tag === "GF" ? "gf" : ""}`}>{tag}</span>)}</div><button className="save-dish" aria-label={`Save ${item.name}`}>♡</button></div>) : <div className="empty-state"><span>✦</span><b>No exact matches here.</b><p>Try another filter or servery for more options.</p></div>}
              </div>
              <button className="menu-link">See full {servery} menu <ArrowIcon /></button>
            </div>
          </div>

          <aside className="side-column">
            <div className="event-card">
              <div className="event-art"><span>✦</span><span>年</span><span>✦</span></div>
              <div className="event-body"><span className="event-label">Special tonight</span><h3>Lunar New Year Dinner</h3><p>Celebrate at North with dumplings, red bean soup, and lion&apos;s head meatballs.</p><div className="event-meta"><span>North Servery</span><span>5:00–8:00 PM</span></div><button className="event-button">Add a reminder <span>+</span></button></div>
            </div>
            <div className="text-preview">
              <div className="preview-header"><span className="phone-dot" /><span>OwlEats text preview</span><span className="preview-time">4:30 PM</span></div>
              <div className="phone-message">✦ <b>OwlEats — What&apos;s for dinner?</b><br /><br /><b>★ North Servery</b><br />Lunar New Year Dumplings (V)<br />Lion&apos;s Head Meatballs<br />Red Bean Soup (VG, GF)<br /><br /><span className="message-event">🌟 SPECIAL EVENT</span><br />Lunar New Year Dinner tonight — starting at 5 PM.<br /><br /><u>Manage preferences →</u></div>
              <button className="preview-link" onClick={() => setShowSetup(true)}>Customize this text <ArrowIcon /></button>
            </div>
          </aside>
        </div>
      </section>

      <footer><span>OwlEats is a Rice Dining concept demo.</span><span>Built to make the walk feel worth it. ✦</span></footer>

      {showSetup && <div className="modal-backdrop" onClick={() => setShowSetup(false)}><div className="setup-modal" onClick={(event) => event.stopPropagation()}><button className="close-button" onClick={() => setShowSetup(false)} aria-label="Close preferences">×</button><p className="eyebrow">Your setup</p><h2>Make OwlEats feel like yours.</h2><p className="modal-copy">This demo keeps your preferences local. SMS delivery and account sign-in come next.</p><label>Favorite servery<select value={servery} onChange={(event) => setServery(event.target.value)}>{serveries.map((name) => <option key={name}>{name}</option>)}</select></label><label>Dietary lens<select value={filter} onChange={(event) => setFilter(event.target.value as Filter)}>{(["All", "Vegan", "Vegetarian", "Halal", "GF"] as Filter[]).map((item) => <option key={item}>{item === "GF" ? "Gluten-free" : item}</option>)}</select></label><button className="primary-button modal-save" onClick={() => setShowSetup(false)}>Save my setup <ArrowIcon /></button></div></div>}
    </main>
  );
}
