<script setup>
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()
</script>

<template>
  <div class="page">
    <div class="container">
      <section class="hero">
        <span class="eyebrow">— simulateur d'investissement</span>
        <h1 class="hero-title">
          Projetez votre épargne.<br>
          <em>Comprenez</em> la puissance<br>
          des intérêts&nbsp;composés.
        </h1>
        <p class="hero-lede">
          FinVest est un petit simulateur conçu pour visualiser comment un capital évolue
          dans le temps — avec ou sans versements réguliers. Sauvegardez vos scénarios,
          comparez-les, et voyez la différence qu'un point de rendement peut faire sur 20 ans.
        </p>

        <div class="hero-cta">
          <RouterLink
            :to="auth.isAuthenticated ? { name: 'simulation-new' } : { name: 'register' }"
            class="btn btn-accent"
          >
            {{ auth.isAuthenticated ? 'Nouvelle simulation' : 'Commencer gratuitement' }}
          </RouterLink>
          <RouterLink v-if="!auth.isAuthenticated" :to="{ name: 'login' }" class="btn btn-outline">
            J'ai déjà un compte
          </RouterLink>
        </div>
      </section>

      <section class="features">
        <div class="feature">
          <span class="feature-num">01</span>
          <h3>Simulation réaliste</h3>
          <p>Capital initial, versements mensuels, taux annuel, durée — tout ce qu'il faut pour modéliser un PEA, une assurance-vie, ou un placement plus exotique.</p>
        </div>
        <div class="feature">
          <span class="feature-num">02</span>
          <h3>Visualisation claire</h3>
          <p>Une courbe simple, lisible, qui sépare ce que vous avez versé de ce que les intérêts vous rapportent. Pas de bruit, que l'essentiel.</p>
        </div>
        <div class="feature">
          <span class="feature-num">03</span>
          <h3>Historique sauvegardé</h3>
          <p>Vos simulations sont stockées dans votre compte. Vous pouvez y revenir, comparer plusieurs scénarios, et affiner votre stratégie dans le temps.</p>
        </div>
      </section>

      <section class="quote-block">
        <blockquote>
          « Les intérêts composés sont la huitième merveille du monde.<br>
          Celui qui les comprend les gagne — celui qui ne les comprend pas les paie. »
        </blockquote>
        <cite>— attribué (sans certitude) à Albert Einstein</cite>
      </section>
    </div>
  </div>
</template>

<style scoped>
.hero {
  max-width: 720px;
  padding: 2rem 0 4rem;
}

.hero-title {
  margin: 0.5rem 0 1.5rem;
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  line-height: 1.05;
}

.hero-title em {
  font-style: italic;
  color: var(--accent);
  font-weight: 500;
}

.hero-lede {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-style: italic;
  color: var(--ink-soft);
  max-width: 58ch;
  margin-bottom: 2rem;
  line-height: 1.55;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
  padding: 4rem 0;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
}

@media (max-width: 800px) {
  .features { grid-template-columns: 1fr; gap: 2rem; }
}

.feature-num {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--accent);
  margin-bottom: 0.75rem;
  letter-spacing: 0.1em;
}

.feature h3 { margin-bottom: 0.75rem; }
.feature p { font-size: 0.95rem; line-height: 1.65; }

.quote-block {
  padding: 5rem 0 2rem;
  max-width: 700px;
  text-align: center;
  margin: 0 auto;
}

blockquote {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-style: italic;
  line-height: 1.5;
  color: var(--ink);
  margin-bottom: 1rem;
  position: relative;
}

blockquote::before {
  content: '"';
  position: absolute;
  font-size: 5rem;
  color: var(--accent);
  top: -1.5rem;
  left: -2.5rem;
  opacity: 0.3;
  font-family: var(--font-display);
}

cite {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-style: normal;
  color: var(--ink-muted);
  letter-spacing: 0.05em;
}
</style>
