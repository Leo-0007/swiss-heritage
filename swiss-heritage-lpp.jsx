// Swiss Heritage - Service Premium de Recherche d'Avoirs LPP
// Version 2.0 - Design 3D Pro + Formulaire Kala-inspired + Conformite LPD
function SwissHeritageLPP() {
  const { useState, useEffect, useRef, useCallback } = React;
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    prenom: '', nom: '', email: '', phone: '',
    dateNaissance: '', canton: '', nationalite: 'suisse',
    statutEmploi: '', nbEmployeurs: '',
    consentement: false
  });
  const [formStatus, setFormStatus] = useState('idle');
  const [formMessage, setFormMessage] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});
  const [currentPage, setCurrentPage] = useState(() => {
    const validPages = ['home', 'privacy', 'legal', 'cgu', 'chomage', 'frontalier', 'retraite', 'changement-emploi'];
    const hash = window.location.hash.replace('#', '');
    return validPages.includes(hash) ? hash : 'home';
  });
  const sectionRefs = useRef({});

  // Scroll-based animations with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 3D tilt effect for cards
  const handleMouseMove = useCallback((e, cardRef) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const tiltX = (y - 0.5) * 10;
    const tiltY = (x - 0.5) * -10;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(10px)`;
  }, []);

  const handleMouseLeave = useCallback((cardRef) => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
  }, []);

  const heroCardRef = useRef(null);

  // GA4 tracking helper (safe if gtag not loaded)
  const trackEvent = useCallback((eventName, params = {}) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formStep === 1) {
      if (!formData.prenom || !formData.nom || !formData.email || !formData.phone) {
        setFormStatus('error');
        setFormMessage('Veuillez remplir tous les champs obligatoires');
        return;
      }
      setFormStatus('idle');
      setFormMessage('');
      setFormStep(2);
      trackEvent('form_step_complete', { step: 1 });
      return;
    }

    if (!formData.consentement) {
      setFormStatus('error');
      setFormMessage('Veuillez accepter les conditions pour continuer');
      return;
    }

    setFormStatus('loading');
    setFormMessage('');
    trackEvent('form_submit', { step: 2, canton: formData.canton, statut_emploi: formData.statutEmploi, nb_employeurs: formData.nbEmployeurs });

    try {
      const response = await fetch('https://n8n.swiss-leads.ch/webhook-test/lpp-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prenom: formData.prenom,
          nom: formData.nom,
          name: `${formData.prenom} ${formData.nom}`,
          email: formData.email,
          phone: formData.phone,
          date_naissance: formData.dateNaissance,
          canton: formData.canton,
          nationalite: formData.nationalite,
          statut_emploi: formData.statutEmploi,
          nb_employeurs: formData.nbEmployeurs,
          consentement_contact: formData.consentement,
          consentement_timestamp: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          source: 'swiss-heritage-website',
          langue: 'fr'
        }),
      });

      if (response.ok) {
        setFormStatus('success');
        setFormMessage('Votre demande a bien ete enregistree. Un conseiller vous contactera sous 24h.');
        trackEvent('form_success', { canton: formData.canton });
        setFormData({
          prenom: '', nom: '', email: '', phone: '',
          dateNaissance: '', canton: '', nationalite: 'suisse',
          statutEmploi: '', nbEmployeurs: '', consentement: false
        });
        setFormStep(1);
      } else {
        throw new Error('Erreur serveur');
      }
    } catch (error) {
      setFormStatus('error');
      setFormMessage('Une erreur est survenue. Veuillez reessayer ou nous contacter directement.');
      trackEvent('form_error', { error_type: 'network' });
    }
  };

  const cantons = [
    'Zurich','Berne','Lucerne','Uri','Schwyz','Obwald','Nidwald','Glaris',
    'Zoug','Fribourg','Soleure','Bale-Ville','Bale-Campagne','Schaffhouse',
    'Appenzell RE','Appenzell RI','Saint-Gall','Grisons','Argovie','Thurgovie',
    'Tessin','Vaud','Valais','Neuchatel','Geneve','Jura'
  ];

  const stats = [
    { value: '55', suffix: 'Mrd', label: "Marche total du libre passage", icon: '💰' },
    { value: '1.35', suffix: 'Mio', label: 'Comptes de libre passage', icon: '📊' },
    { value: '1500', suffix: '+', label: 'Instituts de prevoyance', icon: '🏦' },
    { value: '1/5', suffix: '', label: 'Suisses avec un avoir egare', icon: '🎯' }
  ];

  const steps = [
    {
      num: '01', title: 'Demande Gratuite',
      desc: 'Remplissez notre formulaire securise en quelques minutes. Aucun frais, aucun engagement.',
      icon: '📋', detail: 'Vos donnees sont traitees conformement a la LPD'
    },
    {
      num: '02', title: 'Recherche Officielle',
      desc: 'Via notre partenaire technologique, la Centrale du 2eme pilier et plus de 1500 instituts sont interroges.',
      icon: '🔍', detail: 'Processus 100% digital et securise'
    },
    {
      num: '03', title: 'Resultats Detailles',
      desc: 'Recevez un bilan complet de tous vos avoirs retrouves. Delai usuel : 2 a 3 mois.',
      icon: '📊', detail: 'Centrale 2e pilier : ~2 mois | Institution suppletive : ~1 mois'
    },
    {
      num: '04', title: 'Rapatriement',
      desc: 'Regroupez vos avoirs chez un partenaire financier pour un meilleur rendement.',
      icon: '📈', detail: 'Accompagnement administratif complet'
    }
  ];

  const testimonials = [
    {
      name: 'Marc D.', location: 'Geneve', amount: '47,320 CHF',
      text: "Apres 20 ans de carriere et plusieurs employeurs, je ne pensais pas avoir autant d'avoirs eparpilles. Swiss Heritage a retrouve pres de 50'000 CHF.",
      rating: 5, employers: '6 employeurs'
    },
    {
      name: 'Sophie L.', location: 'Lausanne', amount: '23,850 CHF',
      text: "Un service irreprochable. L'equipe m'a accompagnee du debut a la fin avec un professionnalisme rare. Je recommande sans hesitation.",
      rating: 5, employers: '3 employeurs'
    },
    {
      name: 'Thomas R.', location: 'Zurich', amount: '89,200 CHF',
      text: "Expatrie pendant 10 ans, j'avais perdu la trace de mes cotisations. Grace a Swiss Heritage, j'ai pu recuperer l'integralite de mes avoirs.",
      rating: 5, employers: 'Expatriation'
    }
  ];

  const faqs = [
    {
      q: "Comment fonctionne la recherche d'avoirs LPP ?",
      a: "Notre partenaire technologique interroge la Centrale du 2eme pilier ainsi que l'institution suppletive en votre nom. Vous recevez un rapport complet avec les resultats de la recherche, generalement sous 2 a 3 mois."
    },
    {
      q: "Combien coute le service ?",
      a: "La recherche est entierement gratuite. Des frais de 3% sont preleves uniquement lors du rapatriement effectif des avoirs retrouves, directement deduits du capital rapatrie. Aucune facture supplementaire."
    },
    {
      q: "Qui peut beneficier de ce service ?",
      a: "Toute personne ayant travaille en Suisse et cotise au 2eme pilier (LPP). Les situations les plus frequentes : changement d'employeur, chomage, divorce, expatriation, conge sabbatique, mise a son compte."
    },
    {
      q: "Mes donnees sont-elles securisees ?",
      a: "Absolument. Vos donnees sont traitees conformement a la Loi federale sur la protection des donnees (LPD). Elles ne sont utilisees que dans le cadre strict de votre demande de recherche et ne sont jamais partagees avec des tiers non autorises."
    },
    {
      q: "Que se passe-t-il si aucun avoir n'est retrouve ?",
      a: "Vous ne payez rien. Notre service de recherche est gratuit quel que soit le resultat. Vous recevrez une notification transparente des resultats."
    },
    {
      q: "Qu'est-ce que le rapatriement anticipe ?",
      a: "Vous pouvez lancer une demande de rapatriement des la confirmation de la recherche, sans attendre les resultats definitifs. Si des avoirs eligibles sont retrouves, le transfert sera effectue vers un partenaire financier offrant un meilleur rendement. Votre caisse de pension active n'est jamais touchee."
    }
  ];

  const advantages = [
    { icon: '🏛', title: 'Partenaire Officiel', desc: 'Technologie de recherche interrogeant plus de 1500 instituts via la Centrale du 2eme pilier' },
    { icon: '🔒', title: 'Conforme LPD', desc: 'Donnees traitees selon la loi federale sur la protection des donnees, hebergement suisse' },
    { icon: '💰', title: 'Meilleur Rendement', desc: 'Rapatriement vers des fonds offrant un rendement superieur aux comptes suppletifs (~0.5%/an)' },
    { icon: '⚡', title: '100% Digital', desc: 'Processus entierement en ligne : formulaire, signature electronique, suivi en temps reel' },
    { icon: '🎯', title: 'Sans Engagement', desc: 'Recherche gratuite. Frais uniquement sur le capital effectivement rapatrie (3%)' },
    { icon: '🤝', title: 'Accompagnement', desc: 'Un conseiller dedie vous accompagne a chaque etape, de la recherche au rapatriement' }
  ];

  const situations = [
    { icon: '💼', label: "Changement d'emploi", page: 'changement-emploi' },
    { icon: '✈️', label: "Depart a l'etranger / Frontalier", page: 'frontalier' },
    { icon: '📋', label: "Chomage", page: 'chomage' },
    { icon: '💍', label: "Divorce" },
    { icon: '👶', label: "Conge maternite" },
    { icon: '🏠', label: "Achat immobilier" },
    { icon: '🎓', label: "Mise a son compte" },
    { icon: '🏖', label: "Conge sabbatique" },
    { icon: '📊', label: "Planification retraite", page: 'retraite' },
    { icon: '🔍', label: "Simple curiosite" }
  ];

  // Navigation vers page legale
  const navigateTo = (page) => {
    setCurrentPage(page);
    window.location.hash = page === 'home' ? '' : page;
    window.scrollTo(0, 0);
    trackEvent('page_view', { page_name: page, url: window.location.href });
  };

  // Hash-based routing for landing pages (LinkedIn/Google Ads links)
  useEffect(() => {
    const handleHashChange = () => {
      const validPages = ['home', 'privacy', 'legal', 'cgu', 'chomage', 'frontalier', 'retraite', 'changement-emploi'];
      const hash = window.location.hash.replace('#', '');
      const page = validPages.includes(hash) ? hash : 'home';
      setCurrentPage(page);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // ==============================
  // PAGES LEGALES
  // ==============================

  const LegalPageLayout = ({ title, children }) => (
    <div style={styles.container}>
      <nav style={{
        ...styles.nav,
        background: 'rgba(12, 25, 47, 0.98)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={styles.navContent}>
          <div style={styles.logo} onClick={() => navigateTo('home')} role="button" tabIndex={0}>
            <div style={styles.logoIconWrapper}>
              <span style={styles.logoIcon}>&#9670;</span>
            </div>
            <span style={{...styles.logoText, cursor: 'pointer'}}>Swiss Heritage</span>
          </div>
          <div className="nav-links" style={styles.navLinks}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('home'); }} style={styles.navLink}>Accueil</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('home'); }} style={styles.navCta}>Recherche gratuite</a>
          </div>
        </div>
      </nav>
      <div style={styles.legalPage}>
        <div style={styles.legalContainer}>
          <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('home'); }} style={styles.legalBack}>&#8592; Retour au site</a>
          <h1 style={styles.legalTitle}>{title}</h1>
          <div style={styles.legalContent}>
            {children}
          </div>
        </div>
      </div>
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerBottom}>
            <div style={styles.footerCopy}>
              &copy; {new Date().getFullYear()} SwissEmpire2 Sarl. Tous droits reserves.
            </div>
            <div style={styles.footerCerts}>
              <span style={styles.footerCert}>&#128274; Conforme LPD</span>
              <span style={styles.footerCert}>&#127464;&#127469; Hebergement Suisse</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );

  // PAGE : Politique de confidentialite
  if (currentPage === 'privacy') return (
    <LegalPageLayout title="Politique de Confidentialite">
      <p style={styles.legalMeta}>Derniere mise a jour : fevrier 2026</p>

      <h2 style={styles.legalH2}>1. Responsable du traitement</h2>
      <p style={styles.legalP}>
        SwissEmpire2 Sarl<br />
        CHE-489.583.893<br />
        Moutier, Suisse<br />
        E-mail : <a href="mailto:privacy@swiss-heritage.ch" style={styles.legalLink}>privacy@swiss-heritage.ch</a>
      </p>

      <h2 style={styles.legalH2}>2. Donnees collectees</h2>
      <p style={styles.legalP}>Dans le cadre de votre demande de recherche d'avoirs LPP, nous collectons les donnees suivantes :</p>
      <ul style={styles.legalUl}>
        <li style={styles.legalLi}>Donnees d'identification : prenom, nom, date de naissance, nationalite</li>
        <li style={styles.legalLi}>Donnees de contact : adresse e-mail, numero de telephone</li>
        <li style={styles.legalLi}>Donnees professionnelles : canton de residence, statut d'emploi, nombre d'employeurs</li>
        <li style={styles.legalLi}>Donnees techniques : adresse IP, type de navigateur (collecte automatique)</li>
      </ul>

      <h2 style={styles.legalH2}>3. Finalite du traitement</h2>
      <p style={styles.legalP}>Vos donnees sont traitees exclusivement pour :</p>
      <ul style={styles.legalUl}>
        <li style={styles.legalLi}>Le traitement de votre demande de recherche d'avoirs LPP</li>
        <li style={styles.legalLi}>La transmission a notre partenaire technologique (Kala) pour effectuer la recherche aupres de la Centrale du 2eme pilier</li>
        <li style={styles.legalLi}>La communication relative a l'avancement de votre dossier (telephone, e-mail, WhatsApp)</li>
        <li style={styles.legalLi}>L'amelioration de nos services</li>
      </ul>

      <h2 style={styles.legalH2}>4. Base juridique</h2>
      <p style={styles.legalP}>
        Le traitement de vos donnees repose sur votre consentement explicite, recueilli via la case a cocher du formulaire
        de demande (art. 6 al. 6 et art. 31 al. 1 nLPD).
      </p>

      <h2 style={styles.legalH2}>5. Transmission a des tiers</h2>
      <p style={styles.legalP}>Vos donnees peuvent etre transmises a :</p>
      <ul style={styles.legalUl}>
        <li style={styles.legalLi}><strong>Kala (kala.ch)</strong> : notre partenaire technologique pour la recherche LPP aupres de la Centrale du 2eme pilier</li>
        <li style={styles.legalLi}><strong>Prestataires techniques</strong> : hebergement et envoi d'e-mails (hebergement en Suisse ou UE)</li>
      </ul>
      <p style={styles.legalP}>
        Aucune donnee n'est vendue ou cedee a des tiers a des fins de marketing.
        Aucun transfert de donnees hors de la Suisse ou de l'Espace economique europeen n'est effectue sans garanties appropriees.
      </p>

      <h2 style={styles.legalH2}>6. Duree de conservation</h2>
      <ul style={styles.legalUl}>
        <li style={styles.legalLi}>Leads non convertis : 12 mois apres la demande, puis suppression</li>
        <li style={styles.legalLi}>Dossiers avec avoirs retrouves : duree legale requise (10 ans pour les documents comptables)</li>
        <li style={styles.legalLi}>Donnees techniques (logs) : 90 jours</li>
      </ul>

      <h2 style={styles.legalH2}>7. Vos droits</h2>
      <p style={styles.legalP}>Conformement a la nouvelle Loi federale sur la protection des donnees (nLPD), vous disposez des droits suivants :</p>
      <ul style={styles.legalUl}>
        <li style={styles.legalLi}><strong>Droit d'acces</strong> : obtenir confirmation du traitement de vos donnees et en recevoir une copie</li>
        <li style={styles.legalLi}><strong>Droit de rectification</strong> : demander la correction de donnees inexactes</li>
        <li style={styles.legalLi}><strong>Droit a l'effacement</strong> : demander la suppression de vos donnees</li>
        <li style={styles.legalLi}><strong>Droit a la portabilite</strong> : recevoir vos donnees dans un format structure</li>
        <li style={styles.legalLi}><strong>Droit de retrait du consentement</strong> : retirer votre consentement a tout moment</li>
      </ul>
      <p style={styles.legalP}>
        Pour exercer ces droits, contactez-nous a :
        <a href="mailto:privacy@swiss-heritage.ch" style={styles.legalLink}> privacy@swiss-heritage.ch</a>
      </p>

      <h2 style={styles.legalH2}>8. Securite des donnees</h2>
      <p style={styles.legalP}>
        Nous mettons en oeuvre des mesures techniques et organisationnelles appropriees pour proteger vos donnees contre tout acces
        non autorise, toute modification, divulgation ou destruction. Les communications sont chiffrees (HTTPS/TLS).
      </p>

      <h2 style={styles.legalH2}>9. Cookies</h2>
      <p style={styles.legalP}>
        Notre site utilise uniquement des cookies essentiels au fonctionnement du service.
        Aucun cookie de tracking publicitaire n'est utilise. En cas d'utilisation d'outils d'analyse (ex. Google Analytics),
        l'anonymisation des adresses IP est activee.
      </p>

      <h2 style={styles.legalH2}>10. Autorite de surveillance</h2>
      <p style={styles.legalP}>
        En cas de litige, vous pouvez vous adresser au Prepose federal a la protection des donnees et a la transparence (PFPDT) :<br />
        <a href="https://www.edoeb.admin.ch" target="_blank" rel="noopener noreferrer" style={styles.legalLink}>www.edoeb.admin.ch</a>
      </p>
    </LegalPageLayout>
  );

  // PAGE : Mentions legales
  if (currentPage === 'legal') return (
    <LegalPageLayout title="Mentions Legales">
      <h2 style={styles.legalH2}>Editeur du site</h2>
      <p style={styles.legalP}>
        SwissEmpire2 Sarl<br />
        Numero IDE : CHE-489.583.893<br />
        Siege social : Moutier, Suisse<br />
        E-mail : <a href="mailto:info@swiss-heritage.ch" style={styles.legalLink}>info@swiss-heritage.ch</a>
      </p>

      <h2 style={styles.legalH2}>Nature du service</h2>
      <p style={styles.legalP}>
        Swiss Heritage est un service de recherche administrative d'avoirs de prevoyance professionnelle (LPP / 2eme pilier).
        La recherche est effectuee par notre partenaire technologique Kala (kala.ch) aupres de la Centrale du 2eme pilier
        et des institutions de prevoyance suisses.
      </p>

      <h2 style={styles.legalH2}>Limitation de responsabilite</h2>
      <p style={styles.legalP}>
        Swiss Heritage fournit un service d'information et de mise en relation. Ce service ne constitue en aucun cas
        du conseil financier au sens de la Loi federale sur les services financiers (LSFin).
        Pour tout conseil en placement ou en prevoyance, veuillez consulter un conseiller financier autorise par la FINMA.
      </p>
      <p style={styles.legalP}>
        SwissEmpire2 Sarl decline toute responsabilite quant a l'exactitude, l'exhaustivite ou l'actualite des informations
        publiees sur ce site. Les resultats de la recherche LPP sont fournis par des tiers (institutions de prevoyance, Centrale
        du 2eme pilier) et SwissEmpire2 Sarl ne saurait en garantir l'exactitude.
      </p>

      <h2 style={styles.legalH2}>Propriete intellectuelle</h2>
      <p style={styles.legalP}>
        L'ensemble du contenu de ce site (textes, images, graphismes, logo, icones) est la propriete de SwissEmpire2 Sarl
        ou de ses partenaires et est protege par les lois suisses et internationales relatives a la propriete intellectuelle.
        Toute reproduction, meme partielle, est soumise a autorisation prealable.
      </p>

      <h2 style={styles.legalH2}>Hebergement</h2>
      <p style={styles.legalP}>
        Site heberge par Netlify, Inc.<br />
        Donnees traitees conformement a la legislation suisse sur la protection des donnees (nLPD).
      </p>

      <h2 style={styles.legalH2}>Droit applicable et for juridique</h2>
      <p style={styles.legalP}>
        Le present site et ses conditions d'utilisation sont regis par le droit suisse.
        Le for juridique exclusif est Moutier, canton de Berne, Suisse.
      </p>
    </LegalPageLayout>
  );

  // PAGE : Conditions generales d'utilisation (CGU)
  if (currentPage === 'cgu') return (
    <LegalPageLayout title="Conditions Generales d'Utilisation">
      <p style={styles.legalMeta}>Version en vigueur depuis fevrier 2026</p>

      <h2 style={styles.legalH2}>1. Objet</h2>
      <p style={styles.legalP}>
        Les presentes Conditions Generales d'Utilisation (CGU) regissent l'utilisation du site swiss-heritage.ch
        et du service de recherche d'avoirs LPP propose par SwissEmpire2 Sarl.
      </p>

      <h2 style={styles.legalH2}>2. Description du service</h2>
      <p style={styles.legalP}>
        Swiss Heritage propose un service de recherche administrative d'avoirs de prevoyance professionnelle (LPP)
        non reclames. Le service comprend :
      </p>
      <ul style={styles.legalUl}>
        <li style={styles.legalLi}>La collecte de vos informations via un formulaire en ligne</li>
        <li style={styles.legalLi}>La transmission de votre demande a notre partenaire technologique Kala pour effectuer la recherche</li>
        <li style={styles.legalLi}>La communication des resultats de la recherche</li>
        <li style={styles.legalLi}>L'accompagnement dans le processus de rapatriement des avoirs retrouves</li>
      </ul>

      <h2 style={styles.legalH2}>3. Tarification</h2>
      <p style={styles.legalP}>
        La recherche d'avoirs LPP est gratuite. En cas de rapatriement effectif d'avoirs retrouves,
        des frais de 3% sont appliques sur le montant rapatrie. Ces frais sont directement deduits du capital transfere.
        Aucune facture supplementaire n'est emise.
      </p>

      <h2 style={styles.legalH2}>4. Obligations de l'utilisateur</h2>
      <p style={styles.legalP}>L'utilisateur s'engage a :</p>
      <ul style={styles.legalUl}>
        <li style={styles.legalLi}>Fournir des informations exactes et completes dans le formulaire de demande</li>
        <li style={styles.legalLi}>Etre le titulaire des avoirs recherches ou disposer d'une procuration valable</li>
        <li style={styles.legalLi}>Ne pas utiliser le service a des fins frauduleuses ou illicites</li>
        <li style={styles.legalLi}>Informer Swiss Heritage de tout changement de coordonnees</li>
      </ul>

      <h2 style={styles.legalH2}>5. Obligations de Swiss Heritage</h2>
      <p style={styles.legalP}>Swiss Heritage s'engage a :</p>
      <ul style={styles.legalUl}>
        <li style={styles.legalLi}>Traiter chaque demande dans un delai raisonnable</li>
        <li style={styles.legalLi}>Transmettre les informations au partenaire technologique de maniere securisee</li>
        <li style={styles.legalLi}>Informer l'utilisateur des resultats de la recherche</li>
        <li style={styles.legalLi}>Proteger les donnees personnelles conformement a la nLPD</li>
      </ul>

      <h2 style={styles.legalH2}>6. Delais</h2>
      <p style={styles.legalP}>
        Le delai habituel pour obtenir les resultats d'une recherche LPP est de 2 a 3 mois.
        Ce delai depend des institutions de prevoyance sollicitees et de la Centrale du 2eme pilier.
        Swiss Heritage ne garantit aucun delai specifique et ne saurait etre tenu responsable des retards
        occasionnes par les institutions tierces.
      </p>

      <h2 style={styles.legalH2}>7. Absence de garantie de resultat</h2>
      <p style={styles.legalP}>
        Swiss Heritage ne garantit pas que la recherche aboutira a la decouverte d'avoirs.
        Le service consiste en une demarche de recherche administrative dont le resultat depend
        de l'historique professionnel de l'utilisateur et des informations detenues par les institutions de prevoyance.
      </p>

      <h2 style={styles.legalH2}>8. Resiliation</h2>
      <p style={styles.legalP}>
        L'utilisateur peut retirer son consentement et demander l'arret du traitement de sa demande a tout moment
        en ecrivant a <a href="mailto:privacy@swiss-heritage.ch" style={styles.legalLink}>privacy@swiss-heritage.ch</a>.
        En cas de resiliation, les donnees seront traitees conformement a la politique de confidentialite.
      </p>

      <h2 style={styles.legalH2}>9. Modification des CGU</h2>
      <p style={styles.legalP}>
        SwissEmpire2 Sarl se reserve le droit de modifier les presentes CGU a tout moment.
        Les utilisateurs seront informes de toute modification substantielle. La version en vigueur
        est celle publiee sur le site au moment de l'utilisation du service.
      </p>

      <h2 style={styles.legalH2}>10. Droit applicable</h2>
      <p style={styles.legalP}>
        Les presentes CGU sont regies par le droit suisse. Tout litige sera soumis
        a la competence exclusive des tribunaux de Moutier, canton de Berne, Suisse.
      </p>
    </LegalPageLayout>
  );

  // ==============================
  // LANDING PAGES PAR PERSONA
  // ==============================

  const LandingPageLayout = ({ hero, situations, stats: landingStats, faqItems, ctaText }) => (
    <div style={styles.container}>
      {/* NAV */}
      <nav style={{
        ...styles.nav,
        background: 'rgba(12, 25, 47, 0.98)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={styles.navContent}>
          <div style={styles.logo} onClick={() => navigateTo('home')} role="button" tabIndex={0}>
            <div style={styles.logoIconWrapper}>
              <span style={styles.logoIcon}>&#9670;</span>
            </div>
            <span style={{...styles.logoText, cursor: 'pointer'}}>Swiss Heritage</span>
          </div>
          <div className="nav-links" style={styles.navLinks}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('home'); }} style={styles.navLink}>Accueil</a>
            <a href="#landing-form" style={styles.navCta}>Recherche gratuite</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        ...styles.hero,
        minHeight: 'auto',
        padding: '140px 24px 80px',
      }}>
        <div style={styles.heroOrb1}></div>
        <div style={styles.heroOrb2}></div>
        <div style={{...styles.heroInner, flexDirection: 'column', textAlign: 'center', alignItems: 'center'}}>
          <div style={{...styles.heroContent, maxWidth: '800px', textAlign: 'center'}}>
            <div style={styles.heroTag}>
              <span style={styles.heroTagDot}></span>
              {hero.tag}
            </div>
            <h1 style={{...styles.heroTitle, textAlign: 'center'}}>{hero.title}</h1>
            <p style={{...styles.heroSubtitle, textAlign: 'center', maxWidth: '650px', margin: '0 auto 36px'}}>
              {hero.subtitle}
            </p>
            <div style={{...styles.heroCtas, justifyContent: 'center'}}>
              <a href="#landing-form" style={styles.primaryBtn} onClick={() => trackEvent('cta_click', { cta_type: 'landing_primary', persona: hero.persona })}>
                {hero.cta}
                <span style={styles.btnArrow}>&#8594;</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={styles.stats}>
        <div className="stats-grid" style={styles.statsContainer}>
          {landingStats.map((stat, i) => (
            <div key={i} style={styles.statItem}>
              <div style={styles.statIcon}>{stat.icon}</div>
              <div style={styles.statValue}>{stat.value}<span style={styles.statSuffix}>{stat.suffix}</span></div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SITUATIONS */}
      <section style={{...styles.situationsSection, padding: '80px 24px'}}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionTag}>Situations concernees</div>
          <h2 style={styles.sectionTitle}>Pourquoi verifier <span style={styles.highlight}>maintenant</span> ?</h2>
          <div style={styles.situationsGrid}>
            {situations.map((s, i) => (
              <div key={i} className="hover-3d" style={styles.situationChip}>
                <span style={styles.situationIcon}>{s.icon}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={styles.faq}>
        <div style={styles.faqInner}>
          <div style={styles.sectionTagDark}>Questions frequentes</div>
          <h2 style={styles.faqTitleH2}>Ce que vous devez savoir</h2>
          <div style={styles.faqList}>
            {faqItems.map((faq, i) => (
              <div key={i} style={{
                ...styles.faqItem,
                ...(openFaq === i + 100 ? styles.faqItemOpen : {}),
              }}
                onClick={() => setOpenFaq(openFaq === i + 100 ? null : i + 100)}
              >
                <div style={styles.faqQuestion}>
                  <span>{faq.q}</span>
                  <span style={{
                    ...styles.faqToggle,
                    transform: openFaq === i + 100 ? 'rotate(45deg)' : 'rotate(0deg)',
                  }}>+</span>
                </div>
                <div style={{
                  ...styles.faqAnswer,
                  maxHeight: openFaq === i + 100 ? '500px' : '0',
                  marginTop: openFaq === i + 100 ? '16px' : '0',
                  opacity: openFaq === i + 100 ? 1 : 0,
                }}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FORMULAIRE */}
      <section id="landing-form" style={styles.cta}>
        <div className="cta-grid" style={styles.ctaContent}>
          <div style={styles.ctaLeft}>
            <h2 style={styles.ctaTitle}>
              {ctaText.title} <span style={styles.ctaTitleAccent}>{ctaText.accent}</span>
            </h2>
            <p style={styles.ctaSubtitle}>{ctaText.subtitle}</p>
            <div style={styles.ctaFeatures}>
              <div style={styles.ctaFeature}><span style={styles.ctaCheck}>&#10003;</span> Recherche 100% gratuite</div>
              <div style={styles.ctaFeature}><span style={styles.ctaCheck}>&#10003;</span> Aucun engagement</div>
              <div style={styles.ctaFeature}><span style={styles.ctaCheck}>&#10003;</span> Resultats sous 2-3 mois</div>
              <div style={styles.ctaFeature}><span style={styles.ctaCheck}>&#10003;</span> Conforme LPD/nLPD</div>
            </div>
          </div>
          <div style={styles.ctaRight}>
            <div style={styles.formCard}>
              <div style={styles.formProgress}>
                <div style={{
                  ...styles.formProgressStep,
                  background: '#c9a962',
                  color: '#0c192f',
                }}>1</div>
                <div style={{
                  ...styles.formProgressLine,
                  background: formStep >= 2 ? '#c9a962' : 'rgba(255,255,255,0.15)',
                }}></div>
                <div style={{
                  ...styles.formProgressStep,
                  background: formStep >= 2 ? '#c9a962' : 'rgba(255,255,255,0.15)',
                  color: formStep >= 2 ? '#0c192f' : 'rgba(255,255,255,0.4)',
                }}>2</div>
              </div>
              <div style={styles.formHeader}>
                <h3 style={styles.formTitle}>{formStep === 1 ? 'Vos coordonnees' : 'Votre situation'}</h3>
                <p style={styles.formSubtitle}>{formStep === 1 ? 'Etape 1/2 - Informations de base' : 'Etape 2/2 - Pour affiner la recherche'}</p>
              </div>
              <form style={styles.form} onSubmit={handleSubmit}>
                {formMessage && (
                  <div style={{
                    ...styles.formMessage,
                    ...(formStatus === 'success' ? styles.formMessageSuccess : styles.formMessageError),
                  }}>{formMessage}</div>
                )}
                {formStep === 1 ? (
                  <>
                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Prenom *</label>
                        <input style={styles.formInput} type="text" value={formData.prenom}
                          onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                          placeholder="Jean" required />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Nom *</label>
                        <input style={styles.formInput} type="text" value={formData.nom}
                          onChange={(e) => setFormData({...formData, nom: e.target.value})}
                          placeholder="Dupont" required />
                      </div>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>E-mail *</label>
                      <input style={styles.formInput} type="email" value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="jean.dupont@email.ch" required />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Telephone *</label>
                      <input style={styles.formInput} type="tel" value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+41 79 123 45 67" required />
                    </div>
                  </>
                ) : (
                  <>
                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Canton</label>
                        <select style={styles.formInput} value={formData.canton}
                          onChange={(e) => setFormData({...formData, canton: e.target.value})}>
                          <option value="">Selectionnez</option>
                          {cantons.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Statut</label>
                        <select style={styles.formInput} value={formData.statutEmploi}
                          onChange={(e) => setFormData({...formData, statutEmploi: e.target.value})}>
                          <option value="">Selectionnez</option>
                          <option value="employe">Employe</option>
                          <option value="chomage">Au chomage</option>
                          <option value="independant">Independant</option>
                          <option value="retraite">Retraite</option>
                        </select>
                      </div>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Nombre d'employeurs au cours de votre carriere</label>
                      <select style={styles.formInput} value={formData.nbEmployeurs}
                        onChange={(e) => setFormData({...formData, nbEmployeurs: e.target.value})}>
                        <option value="">Selectionnez</option>
                        <option value="1-2">1 a 2</option>
                        <option value="3-5">3 a 5</option>
                        <option value="6-10">6 a 10</option>
                        <option value="10+">Plus de 10</option>
                      </select>
                    </div>
                    <div style={styles.consentBox}>
                      <label style={styles.consentLabel}>
                        <input type="checkbox" style={styles.consentCheckbox}
                          checked={formData.consentement}
                          onChange={(e) => setFormData({...formData, consentement: e.target.checked})} />
                        <span style={styles.consentText}>
                          J'accepte que SwissEmpire2 Sarl me contacte par telephone, WhatsApp et/ou
                          e-mail dans le cadre de ma demande de recherche d'avoirs LPP. Mes donnees
                          seront traitees conformement a la{' '}
                          <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigateTo('privacy'); }} style={{color: '#c9a962', textDecoration: 'underline'}}>politique de confidentialite</a>.
                        </span>
                      </label>
                    </div>
                  </>
                )}
                <div style={styles.formActions}>
                  {formStep === 2 && (
                    <button type="button" style={styles.formBackBtn} onClick={() => setFormStep(1)}>&#8592; Retour</button>
                  )}
                  <button type="submit" style={{...styles.formButton, opacity: formStatus === 'loading' ? 0.7 : 1, flex: 1}}
                    disabled={formStatus === 'loading'}>
                    {formStatus === 'loading' ? 'Envoi en cours...' : formStep === 1 ? 'Continuer &#8594;' : 'Lancer ma recherche gratuite &#8594;'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerDisclaimer}>
            Swiss Heritage est un service de SwissEmpire2 Sarl (CHE-489.583.893), Moutier.
            Service de recherche administrative d'avoirs de prevoyance professionnelle (LPP).
            Ce service ne constitue pas du conseil financier au sens de la LSFIN.
          </div>
          <div style={styles.footerBottom}>
            <div style={styles.footerCopy}>
              &copy; {new Date().getFullYear()} SwissEmpire2 Sarl. Tous droits reserves.
            </div>
            <div style={styles.footerCerts}>
              <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('privacy'); }} style={styles.footerLink}>Confidentialite</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('legal'); }} style={styles.footerLink}>Mentions legales</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('cgu'); }} style={styles.footerLink}>CGU</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );

  // LANDING : Chomage
  if (currentPage === 'chomage') return (
    <LandingPageLayout
      hero={{
        tag: 'Vous venez de perdre votre emploi ?',
        title: <>Verifiez vos avoirs LPP <span style={styles.heroTitleAccent}>avant qu'il ne soit trop tard</span></>,
        subtitle: "Le chomage est le moment ou vous risquez le plus de perdre la trace de vos avoirs de prevoyance. Chaque changement d'employeur a pu laisser des cotisations oubliees. Verifiez maintenant, c'est gratuit.",
        cta: 'Verifier mes avoirs gratuitement',
        persona: 'chomage',
      }}
      situations={[
        { icon: '📋', label: 'Inscription au RAV/ORP' },
        { icon: '💼', label: 'Fin de contrat' },
        { icon: '🔄', label: 'Licenciement' },
        { icon: '⏰', label: 'Fin de chomage' },
        { icon: '📊', label: 'Plusieurs employeurs passes' },
        { icon: '❓', label: "Pas de suivi LPP" },
      ]}
      stats={[
        { value: '55', suffix: 'Mrd', label: 'CHF en avoirs de libre passage en Suisse', icon: '💰' },
        { value: '1/5', suffix: '', label: 'Suisses ont des avoirs egares', icon: '🎯' },
        { value: '3', suffix: '+', label: "Employeurs en moyenne = risque d'oubli", icon: '💼' },
        { value: '0', suffix: 'CHF', label: 'Cout de la recherche', icon: '🆓' },
      ]}
      faqItems={[
        { q: "Je viens de m'inscrire au chomage, que devient ma LPP ?", a: "Votre avoir LPP est transfere sur un compte de libre passage. Si vous avez eu plusieurs employeurs, il est possible que des avoirs anterieurs dorment sur des comptes oublies. C'est le moment ideal pour verifier." },
        { q: "La recherche est-elle vraiment gratuite ?", a: "Oui, la recherche est 100% gratuite. Des frais de 3% s'appliquent uniquement en cas de rapatriement effectif d'avoirs retrouves." },
        { q: "Combien de temps prend la recherche ?", a: "La recherche prend generalement 2 a 3 mois. Notre partenaire interroge la Centrale du 2eme pilier et plus de 1500 instituts de prevoyance." },
        { q: "Mes indemnites chomage sont-elles affectees ?", a: "Non. La recherche d'avoirs LPP n'a aucun impact sur vos indemnites chomage. Ce sont des avoirs de prevoyance distincts." },
      ]}
      ctaText={{
        title: 'Lancez votre recherche',
        accent: 'gratuitement',
        subtitle: "Ne laissez pas vos avoirs dormir. En 2 minutes, lancez une recherche gratuite et decouvrez si vous avez des avoirs LPP oublies.",
      }}
    />
  );

  // LANDING : Frontalier / Expat
  if (currentPage === 'frontalier') return (
    <LandingPageLayout
      hero={{
        tag: 'Vous quittez la Suisse ?',
        title: <>Vos avoirs LPP suisses <span style={styles.heroTitleAccent}>vous attendent</span></>,
        subtitle: "En quittant la Suisse, vos cotisations LPP restent dans le systeme suisse. Si vous ne les reclamez pas, elles risquent d'etre oubliees definitivement. Agissez avant votre depart.",
        cta: 'Retrouver mes avoirs suisses',
        persona: 'frontalier',
      }}
      situations={[
        { icon: '✈️', label: 'Depart definitif de Suisse' },
        { icon: '🌍', label: 'Expatriation' },
        { icon: '🇫🇷', label: 'Retour en France' },
        { icon: '🚗', label: 'Frontalier en fin de contrat' },
        { icon: '🏠', label: "Demenagement a l'etranger" },
        { icon: '🔄', label: 'Changement de pays' },
      ]}
      stats={[
        { value: '55', suffix: 'Mrd', label: 'CHF en avoirs de libre passage', icon: '💰' },
        { value: '350', suffix: "k+", label: 'Frontaliers travaillent en Suisse', icon: '🇨🇭' },
        { value: '1500', suffix: '+', label: 'Instituts interroges', icon: '🏦' },
        { value: '2-3', suffix: 'mois', label: 'Delai de recherche', icon: '📅' },
      ]}
      faqItems={[
        { q: "Je quitte la Suisse, que devient ma LPP ?", a: "Vos avoirs LPP restent en Suisse sur un compte de libre passage. Selon votre destination (UE/AELE ou hors UE), vous pouvez recuperer tout ou partie de vos avoirs. Dans tous les cas, il faut d'abord les localiser." },
        { q: "Je suis frontalier, ai-je cotise a la LPP ?", a: "Oui, tout employe en Suisse cotise a la LPP des que son salaire depasse le seuil d'entree (~22'050 CHF/an). Si vous avez eu plusieurs employeurs suisses, il est probable que des avoirs soient eparpilles." },
        { q: "Puis-je recuperer mes avoirs depuis l'etranger ?", a: "Oui. La recherche se fait entierement en ligne. Une fois les avoirs localises, le rapatriement peut etre effectue a distance avec un accompagnement administratif." },
        { q: "Y a-t-il un delai pour reclamer mes avoirs ?", a: "Il n'y a pas de delai de prescription pour les avoirs LPP. Mais plus vous attendez, plus il est difficile de retrouver la trace de vos cotisations. Agissez maintenant." },
      ]}
      ctaText={{
        title: "N'oubliez pas vos avoirs",
        accent: 'suisses',
        subtitle: "Frontalier ou expatrie, vos cotisations LPP meritent d'etre retrouvees. Lancez une recherche gratuite en 2 minutes.",
      }}
    />
  );

  // LANDING : Retraite
  if (currentPage === 'retraite') return (
    <LandingPageLayout
      hero={{
        tag: 'Vous preparez votre retraite ?',
        title: <>Retrouvez <span style={styles.heroTitleAccent}>tous</span> vos avoirs de prevoyance</>,
        subtitle: "Apres une carriere de 30 ou 40 ans avec plusieurs employeurs, il est frequent d'avoir des avoirs LPP eparpilles. Avant la retraite, regroupez-les pour maximiser votre capital.",
        cta: 'Verifier mes avoirs avant la retraite',
        persona: 'retraite',
      }}
      situations={[
        { icon: '📊', label: 'Planification retraite' },
        { icon: '💼', label: 'Carriere longue (30+ ans)' },
        { icon: '🔄', label: 'Multiples employeurs' },
        { icon: '🏦', label: 'Comptes de libre passage oublies' },
        { icon: '📈', label: 'Optimisation du capital' },
        { icon: '⏰', label: 'Approche des 58-65 ans' },
      ]}
      stats={[
        { value: '55', suffix: 'Mrd', label: 'CHF en avoirs de libre passage', icon: '💰' },
        { value: '47', suffix: "k", label: 'CHF retrouves en moyenne', icon: '🎯' },
        { value: '1/5', suffix: '', label: 'Suisses ont des avoirs oublies', icon: '📊' },
        { value: '0', suffix: 'CHF', label: 'Cout de la recherche', icon: '🆓' },
      ]}
      faqItems={[
        { q: "J'ai 60 ans, est-ce trop tard pour chercher mes avoirs ?", a: "Non, il n'est jamais trop tard. Au contraire, c'est le moment ideal pour faire le bilan complet de vos avoirs avant la retraite. Plus vous consolidez tot, meilleur sera votre rendement." },
        { q: "Combien d'avoirs peut-on retrouver en moyenne ?", a: "Le montant varie selon votre parcours professionnel. Les personnes ayant eu 5+ employeurs retrouvent souvent entre 20'000 et 100'000 CHF d'avoirs oublies." },
        { q: "Comment regrouper mes avoirs retrouves ?", a: "Une fois localises, vos avoirs peuvent etre transferes vers un compte de libre passage offrant un meilleur rendement, ou directement integres a votre caisse de pension active si elle l'accepte." },
        { q: "Ma caisse de pension actuelle est-elle affectee ?", a: "Non. La recherche porte sur d'anciens avoirs de libre passage. Votre caisse de pension active n'est jamais touchee." },
      ]}
      ctaText={{
        title: 'Preparez votre retraite',
        accent: 'sereinement',
        subtitle: "Retrouvez tous vos avoirs de prevoyance avant la retraite. Recherche gratuite, resultats sous 2-3 mois.",
      }}
    />
  );

  // LANDING : Changement d'emploi
  if (currentPage === 'changement-emploi') return (
    <LandingPageLayout
      hero={{
        tag: 'Nouveau job ?',
        title: <>Vos anciens avoirs LPP <span style={styles.heroTitleAccent}>meritent votre attention</span></>,
        subtitle: "A chaque changement d'employeur, vos cotisations LPP sont transferees. Mais parfois, une partie reste sur un compte de libre passage oublie. Verifiez en 2 minutes.",
        cta: "Verifier mes anciens avoirs",
        persona: 'changement-emploi',
      }}
      situations={[
        { icon: '🔄', label: "Changement d'employeur" },
        { icon: '📋', label: 'Periode entre deux emplois' },
        { icon: '🏢', label: 'Restructuration / fusion' },
        { icon: '💼', label: '3+ employeurs dans la carriere' },
        { icon: '📊', label: 'Pas de suivi LPP' },
        { icon: '🎓', label: 'Reprise detudes' },
      ]}
      stats={[
        { value: '55', suffix: 'Mrd', label: 'CHF en avoirs de libre passage', icon: '💰' },
        { value: '1.35', suffix: 'Mio', label: 'Comptes de libre passage en Suisse', icon: '📊' },
        { value: '3', suffix: '+', label: "Employeurs = risque d'oubli eleve", icon: '💼' },
        { value: '0', suffix: 'CHF', label: 'Cout de la recherche', icon: '🆓' },
      ]}
      faqItems={[
        { q: "J'ai change d'emploi, ma LPP a-t-elle suivi ?", a: "Normalement oui, mais il arrive que le transfert ne se fasse pas correctement, surtout s'il y a eu une periode de chomage ou de freelance entre deux emplois. C'est dans ces periodes de transition que les avoirs se perdent." },
        { q: "J'ai eu 5 employeurs, combien d'avoirs puis-je retrouver ?", a: "Plus vous avez eu d'employeurs, plus le risque d'avoir des avoirs eparpilles est eleve. En moyenne, les personnes avec 5+ employeurs retrouvent entre 20'000 et 50'000 CHF." },
        { q: "Comment savoir si j'ai des avoirs oublies ?", a: "C'est exactement ce que notre service propose. En remplissant le formulaire, vous lancez une recherche gratuite aupres de la Centrale du 2eme pilier et de plus de 1500 instituts de prevoyance." },
        { q: "Que se passe-t-il si rien n'est retrouve ?", a: "Vous ne payez rien. La recherche est gratuite quel que soit le resultat." },
      ]}
      ctaText={{
        title: 'Nouveau depart,',
        accent: 'nouveaux avoirs ?',
        subtitle: "Profitez de votre changement d'emploi pour verifier si vous avez des avoirs LPP oublies. C'est gratuit et sans engagement.",
      }}
    />
  );

  // ==============================
  // RENDER (page principale)
  // ==============================
  return (
    <div style={styles.container}>
      {/* ========== NAVIGATION ========== */}
      <nav style={{
        ...styles.nav,
        background: isScrolled ? 'rgba(12, 25, 47, 0.98)' : 'transparent',
        boxShadow: isScrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
      }}>
        <div style={styles.navContent}>
          <div style={styles.logo}>
            <div style={styles.logoIconWrapper}>
              <span style={styles.logoIcon}>◆</span>
            </div>
            <span style={styles.logoText}>Swiss Heritage</span>
          </div>
          <div className="nav-links" style={styles.navLinks}>
            <a href="#process" style={styles.navLink}>Processus</a>
            <a href="#advantages" style={styles.navLink}>Avantages</a>
            <a href="#testimonials" style={styles.navLink}>Temoignages</a>
            <a href="#faq" style={styles.navLink}>FAQ</a>
          </div>
          <a href="#contact" style={styles.navCta}>
            Recherche Gratuite
            <span style={{ marginLeft: '8px', fontSize: '14px' }}>→</span>
          </a>
        </div>
      </nav>

      {/* ========== HERO WITH 3D ELEMENTS ========== */}
      <section style={styles.hero}>
        {/* Animated background orbs */}
        <div style={styles.heroOrb1} />
        <div style={styles.heroOrb2} />
        <div style={styles.heroOrb3} />
        <div style={styles.heroPattern} />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${4 + i * 2}px`,
            height: `${4 + i * 2}px`,
            background: 'rgba(201, 169, 98, 0.3)',
            borderRadius: '50%',
            left: `${15 + i * 14}%`,
            bottom: '10%',
            animation: `particleFloat ${8 + i * 2}s ease-in-out ${i * 1.5}s infinite`,
          }} />
        ))}

        <div style={styles.heroInner}>
          <div style={styles.heroContent}>
            <div style={{
              ...styles.heroTag,
              animation: 'fadeInLeft 0.8s ease-out forwards',
            }}>
              <span style={styles.heroTagDot} />
              Service Premium de Prevoyance
            </div>
            <h1 style={{
              ...styles.heroTitle,
              animation: 'fadeInUp 0.8s ease-out 0.2s forwards',
              opacity: 0,
            }}>
              Retrouvez vos avoirs{' '}
              <span style={styles.heroTitleAccent}>LPP oublies</span>
            </h1>
            <p style={{
              ...styles.heroSubtitle,
              animation: 'fadeInUp 0.8s ease-out 0.4s forwards',
              opacity: 0,
            }}>
              <strong>55 milliards de francs</strong> dorment en libre passage en Suisse.
              <br />1 Suisse sur 5 possede un avoir egare. Et vous ?
            </p>
            <div style={{
              ...styles.heroCtas,
              animation: 'fadeInUp 0.8s ease-out 0.6s forwards',
              opacity: 0,
            }}>
              <a href="#contact" style={styles.primaryBtn} onClick={() => trackEvent('cta_click', { cta_type: 'primary' })}>
                Lancer ma recherche gratuite
                <span style={styles.btnArrow}>→</span>
              </a>
              <a href="#process" style={styles.secondaryBtn} onClick={() => trackEvent('cta_click', { cta_type: 'secondary' })}>
                Decouvrir le processus
              </a>
            </div>
            <div style={{
              ...styles.heroTrust,
              animation: 'fadeInUp 0.8s ease-out 0.8s forwards',
              opacity: 0,
            }}>
              <div style={styles.trustItem}>
                <span style={styles.trustCheck}>✓</span>
                100% Gratuit
              </div>
              <div style={styles.trustItem}>
                <span style={styles.trustCheck}>✓</span>
                Sans engagement
              </div>
              <div style={styles.trustItem}>
                <span style={styles.trustCheck}>✓</span>
                Conforme LPD
              </div>
            </div>
          </div>

          {/* 3D Floating Hero Card */}
          <div className="hero-visual" style={styles.heroVisual}>
            <div
              ref={heroCardRef}
              style={styles.heroCard}
              onMouseMove={(e) => handleMouseMove(e, heroCardRef)}
              onMouseLeave={() => handleMouseLeave(heroCardRef)}
            >
              <div style={styles.cardGlow} />
              <div style={styles.cardHeader}>
                <span style={styles.cardBadge}>Confidentiel</span>
                <span style={styles.cardLogo}>◆</span>
              </div>
              <div style={styles.cardContent}>
                <div style={styles.cardLabel}>Avoirs retrouves</div>
                <div style={styles.cardAmount}>CHF 47'320.—</div>
                <div style={styles.cardBar}>
                  <div style={styles.cardBarFill} />
                </div>
                <div style={styles.cardDetails}>
                  <div style={styles.cardDetail}>
                    <span style={styles.detailLabel}>Instituts verifies</span>
                    <span style={styles.detailValue}>1,543</span>
                  </div>
                  <div style={styles.cardDetail}>
                    <span style={styles.detailLabel}>Comptes retrouves</span>
                    <span style={styles.detailValue}>3</span>
                  </div>
                </div>
              </div>
              <div style={styles.cardFooter}>
                <div style={styles.cardStatus}>
                  <span style={styles.statusDot} />
                  Recherche completee
                </div>
              </div>
            </div>
            {/* Shadow beneath card */}
            <div style={styles.cardShadow} />
          </div>
        </div>
      </section>

      {/* ========== STATS SECTION ========== */}
      <section style={styles.stats} id="sec-stats" data-animate>
        <div className="stats-grid" style={styles.statsContainer}>
          {stats.map((stat, i) => (
            <div key={i} style={{
              ...styles.statItem,
              animation: visibleSections['sec-stats'] ? `fadeInUp 0.6s ease-out ${i * 0.15}s forwards` : 'none',
              opacity: visibleSections['sec-stats'] ? undefined : 0,
            }}>
              <div style={styles.statIcon}>{stat.icon}</div>
              <div style={styles.statValue}>
                {stat.value}<span style={styles.statSuffix}>{stat.suffix}</span>
              </div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== SITUATIONS SECTION ========== */}
      <section style={styles.situationsSection} id="sec-situations" data-animate>
        <div style={styles.sectionInner}>
          <div style={styles.sectionTag}>Etes-vous concerne ?</div>
          <h2 style={styles.sectionTitle}>
            Ces situations peuvent cacher{' '}
            <span style={styles.highlight}>des avoirs oublies</span>
          </h2>
          <p style={styles.sectionSubtitle}>
            Chaque fois qu'une personne quitte son employeur sans indiquer ou transferer ses avoirs,
            ceux-ci sont envoyes a l'institution suppletive. Voici les situations les plus courantes :
          </p>
          <div style={styles.situationsGrid}>
            {situations.map((sit, i) => (
              <div key={i} className="hover-3d" onClick={sit.page ? () => { trackEvent('situation_click', { situation: sit.label, persona: sit.page }); navigateTo(sit.page); } : undefined} style={{
                ...styles.situationChip,
                cursor: sit.page ? 'pointer' : 'default',
                animation: visibleSections['sec-situations'] ? `fadeInUp 0.5s ease-out ${i * 0.08}s forwards` : 'none',
                opacity: visibleSections['sec-situations'] ? undefined : 0,
                position: 'relative',
              }}>
                <span style={styles.situationIcon}>{sit.icon}</span>
                <span style={styles.situationLabel}>{sit.label}</span>
                {sit.page && <span style={{ fontSize: '0.7rem', color: '#c9a962', marginLeft: 6 }}>→ En savoir plus</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PROCESS SECTION ========== */}
      <section id="process" style={styles.process} data-animate>
        <div style={styles.sectionInner}>
          <div style={styles.sectionTagDark}>Notre processus</div>
          <h2 style={styles.processTitleH2}>
            Simple, rapide et{' '}
            <span style={styles.highlightGold}>entierement gratuit</span>
          </h2>
          <div className="four-col" style={styles.stepsGrid}>
            {steps.map((step, i) => (
              <div key={i} className="hover-3d" style={{
                ...styles.stepCard,
                animation: visibleSections['process'] ? `rotateIn 0.7s ease-out ${i * 0.15}s forwards` : 'none',
                opacity: visibleSections['process'] ? undefined : 0,
              }}>
                <div style={styles.stepNumBadge}>{step.num}</div>
                <div style={styles.stepIconLarge}>{step.icon}</div>
                <h3 style={styles.stepTitle}>{step.title}</h3>
                <p style={styles.stepDesc}>{step.desc}</p>
                <div style={styles.stepDetail}>{step.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== ADVANTAGES SECTION ========== */}
      <section id="advantages" style={styles.advantages} data-animate>
        <div style={styles.sectionInner}>
          <div style={styles.sectionTag}>Pourquoi nous choisir</div>
          <h2 style={styles.sectionTitle}>
            L'excellence suisse au service{' '}
            <span style={styles.highlight}>de votre prevoyance</span>
          </h2>
          <div className="three-col" style={styles.advantagesGrid}>
            {advantages.map((adv, i) => (
              <div key={i} className="hover-3d" style={{
                ...styles.advantageCard,
                animation: visibleSections['advantages'] ? `fadeInUp 0.6s ease-out ${i * 0.1}s forwards` : 'none',
                opacity: visibleSections['advantages'] ? undefined : 0,
              }}>
                <div style={styles.advantageIconWrapper}>{adv.icon}</div>
                <h3 style={styles.advantageTitle}>{adv.title}</h3>
                <p style={styles.advantageDesc}>{adv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== COMPARISON SECTION ========== */}
      <section style={styles.comparison} id="sec-comparison" data-animate>
        <div style={styles.sectionInner}>
          <div style={styles.sectionTagDark}>Comparaison</div>
          <h2 style={styles.comparisonTitleH2}>
            Ne laissez plus votre argent{' '}
            <span style={styles.highlightGold}>stagner</span>
          </h2>
          <div className="comparison-grid" style={styles.comparisonTable}>
            <div style={styles.comparisonCol}>
              <div style={styles.comparisonHeader}>
                <span style={styles.comparisonBad}>Institution suppletive</span>
              </div>
              <div style={styles.comparisonBody}>
                {['Rendement ~0.5%/an', 'Aucun suivi personnalise', 'Demarches complexes', 'Avoirs disperses', 'Frais caches'].map((item, i) => (
                  <div key={i} style={styles.comparisonItem}>
                    <span style={styles.comparisonX}>✗</span>{item}
                  </div>
                ))}
              </div>
            </div>
            <div style={styles.comparisonColHighlight}>
              <div style={styles.comparisonHeaderHL}>
                <span style={styles.comparisonGood}>◆ Swiss Heritage</span>
              </div>
              <div style={styles.comparisonBodyHL}>
                {['Rendement optimise via partenaires', 'Conseiller dedie', '100% digital et simple', 'Avoirs centralises', 'Frais transparents : 3% du rapatrie'].map((item, i) => (
                  <div key={i} style={styles.comparisonItem}>
                    <span style={styles.comparisonCheck}>✓</span>{item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={styles.comparisonExample}>
            <div style={styles.exampleText}>
              <strong>Exemple concret :</strong> Capital de CHF 12'838 (moyenne suisse par habitant en libre passage)
            </div>
            <div style={styles.exampleResults}>
              <div style={styles.exampleBad}>
                Institution suppletive (10 ans) : <strong>CHF 13'500</strong>
              </div>
              <div style={styles.exampleGood}>
                Partenaire Swiss Heritage : <strong>CHF 17'200+</strong>
              </div>
            </div>
            <div style={styles.exampleDiff}>
              Difference potentielle : <span style={styles.diffAmount}>+CHF 3'700</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS SECTION ========== */}
      <section id="testimonials" style={styles.testimonials} data-animate>
        <div style={styles.sectionInner}>
          <div style={styles.sectionTag}>Temoignages</div>
          <h2 style={styles.sectionTitle}>
            Ils ont retrouve leurs{' '}
            <span style={styles.highlight}>avoirs oublies</span>
          </h2>
          <div className="three-col" style={styles.testimonialsGrid}>
            {testimonials.map((t, i) => (
              <div key={i} className="hover-3d" style={{
                ...styles.testimonialCard,
                animation: visibleSections['testimonials'] ? `fadeInUp 0.6s ease-out ${i * 0.15}s forwards` : 'none',
                opacity: visibleSections['testimonials'] ? undefined : 0,
              }}>
                <div style={styles.testimonialStars}>{'★'.repeat(t.rating)}</div>
                <p style={styles.testimonialText}>"{t.text}"</p>
                <div style={styles.testimonialMeta}>
                  <span style={styles.testimonialEmployers}>{t.employers}</span>
                </div>
                <div style={styles.testimonialFooter}>
                  <div style={styles.testimonialAuthor}>
                    <div style={styles.testimonialAvatar}>{t.name.charAt(0)}</div>
                    <div>
                      <div style={styles.testimonialName}>{t.name}</div>
                      <div style={styles.testimonialLocation}>{t.location}</div>
                    </div>
                  </div>
                  <div style={styles.testimonialAmount}>
                    <div style={styles.amountLabel}>Retrouves</div>
                    <div style={styles.amountValue}>{t.amount}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FAQ SECTION ========== */}
      <section id="faq" style={styles.faq} data-animate>
        <div style={styles.faqInner}>
          <div style={styles.sectionTagDark}>Questions frequentes</div>
          <h2 style={styles.faqTitleH2}>
            Tout ce que vous devez{' '}
            <span style={styles.highlightGold}>savoir</span>
          </h2>
          <div style={styles.faqList}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                style={{
                  ...styles.faqItem,
                  ...(openFaq === i ? styles.faqItemOpen : {}),
                }}
                onClick={() => { setOpenFaq(openFaq === i ? null : i); if (openFaq !== i) trackEvent('faq_open', { faq_index: i, faq_question: faq.q }); }}
              >
                <div style={styles.faqQuestion}>
                  <span>{faq.q}</span>
                  <span style={{
                    ...styles.faqToggle,
                    transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)',
                  }}>+</span>
                </div>
                <div style={{
                  ...styles.faqAnswer,
                  maxHeight: openFaq === i ? '300px' : '0',
                  opacity: openFaq === i ? 1 : 0,
                  paddingTop: openFaq === i ? '16px' : '0',
                }}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CONTACT / FORM SECTION ========== */}
      <section id="contact" style={styles.cta} data-animate>
        <div className="cta-grid" style={styles.ctaContent}>
          <div style={styles.ctaLeft}>
            <h2 style={styles.ctaTitle}>
              Commencez votre recherche{' '}
              <span style={styles.ctaTitleAccent}>gratuitement</span>
            </h2>
            <p style={styles.ctaSubtitle}>
              Remplissez le formulaire et decouvrez si vous avez des avoirs LPP dormants.
              Notre partenaire technologique interrogera plus de 1'500 instituts de prevoyance en votre nom.
            </p>
            <div style={styles.ctaFeatures}>
              <div style={styles.ctaFeature}><span style={styles.ctaCheck}>✓</span> Recherche 100% gratuite</div>
              <div style={styles.ctaFeature}><span style={styles.ctaCheck}>✓</span> Aucun engagement</div>
              <div style={styles.ctaFeature}><span style={styles.ctaCheck}>✓</span> Resultats sous 2-3 mois</div>
              <div style={styles.ctaFeature}><span style={styles.ctaCheck}>✓</span> Accompagnement personnalise</div>
              <div style={styles.ctaFeature}><span style={styles.ctaCheck}>✓</span> Conforme LPD/nLPD</div>
              <div style={styles.ctaFeature}><span style={styles.ctaCheck}>✓</span> Donnees hebergees en Suisse</div>
            </div>
          </div>
          <div style={styles.ctaRight}>
            <div style={styles.formCard}>
              {/* Progress indicator */}
              <div style={styles.formProgress}>
                <div style={{
                  ...styles.formProgressStep,
                  background: '#c9a962',
                  color: '#0c192f',
                }}>1</div>
                <div style={{
                  ...styles.formProgressLine,
                  background: formStep >= 2 ? '#c9a962' : 'rgba(255,255,255,0.2)',
                }} />
                <div style={{
                  ...styles.formProgressStep,
                  background: formStep >= 2 ? '#c9a962' : 'rgba(255,255,255,0.1)',
                  color: formStep >= 2 ? '#0c192f' : 'rgba(255,255,255,0.5)',
                }}>2</div>
              </div>
              <div style={styles.formHeader}>
                <h3 style={styles.formTitle}>
                  {formStep === 1 ? 'Vos coordonnees' : 'Informations complementaires'}
                </h3>
                <p style={styles.formSubtitle}>
                  {formStep === 1 ? 'Etape 1/2 — Informations de contact' : 'Etape 2/2 — Pour optimiser votre recherche'}
                </p>
              </div>
              <form style={styles.form} onSubmit={handleSubmit}>
                {formStep === 1 ? (
                  <>
                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Prenom *</label>
                        <input type="text" style={styles.formInput} placeholder="Jean"
                          value={formData.prenom}
                          onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                          required />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Nom *</label>
                        <input type="text" style={styles.formInput} placeholder="Dupont"
                          value={formData.nom}
                          onChange={(e) => setFormData({...formData, nom: e.target.value})}
                          required />
                      </div>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Email *</label>
                      <input type="email" style={styles.formInput} placeholder="jean.dupont@email.ch"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Telephone *</label>
                      <input type="tel" style={styles.formInput} placeholder="+41 79 123 45 67"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required />
                    </div>
                  </>
                ) : (
                  <>
                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Date de naissance</label>
                        <input type="date" style={styles.formInput}
                          value={formData.dateNaissance}
                          onChange={(e) => setFormData({...formData, dateNaissance: e.target.value})} />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Canton</label>
                        <select style={styles.formInput}
                          value={formData.canton}
                          onChange={(e) => setFormData({...formData, canton: e.target.value})}>
                          <option value="">Selectionner...</option>
                          {cantons.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Situation professionnelle</label>
                        <select style={styles.formInput}
                          value={formData.statutEmploi}
                          onChange={(e) => setFormData({...formData, statutEmploi: e.target.value})}>
                          <option value="">Selectionner...</option>
                          <option value="employe">Employe(e)</option>
                          <option value="independant">Independant(e)</option>
                          <option value="chomage">Au chomage</option>
                          <option value="retraite">Retraite(e)</option>
                          <option value="autre">Autre</option>
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Nombre d'employeurs passes</label>
                        <select style={styles.formInput}
                          value={formData.nbEmployeurs}
                          onChange={(e) => setFormData({...formData, nbEmployeurs: e.target.value})}>
                          <option value="">Selectionner...</option>
                          <option value="1-2">1-2 employeurs</option>
                          <option value="3-5">3-5 employeurs</option>
                          <option value="6-10">6-10 employeurs</option>
                          <option value="10+">Plus de 10</option>
                        </select>
                      </div>
                    </div>

                    {/* Consent checkbox - LPD compliant */}
                    <div style={styles.consentBox}>
                      <label style={styles.consentLabel}>
                        <input type="checkbox" style={styles.consentCheckbox}
                          checked={formData.consentement}
                          onChange={(e) => setFormData({...formData, consentement: e.target.checked})} />
                        <span style={styles.consentText}>
                          J'accepte que SwissEmpire2 Sarl me contacte par telephone, WhatsApp et/ou
                          e-mail dans le cadre de ma demande de recherche d'avoirs LPP. Mes donnees
                          seront traitees conformement a la{' '}
                          <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigateTo('privacy'); }} style={{color: '#c9a962', textDecoration: 'underline'}}>politique de confidentialite</a>
                          {' '}et pourront etre transmises aux prestataires de recherche LPP dans le cadre de cette
                          demarche. Je peux retirer mon consentement a tout moment en ecrivant a
                          privacy@swiss-heritage.ch.
                        </span>
                      </label>
                    </div>
                  </>
                )}

                {formMessage && (
                  <div style={{
                    ...styles.formMessage,
                    ...(formStatus === 'success' ? styles.formMessageSuccess : {}),
                    ...(formStatus === 'error' ? styles.formMessageError : {}),
                  }}>
                    {formStatus === 'success' && '✓ '}
                    {formStatus === 'error' && '✗ '}
                    {formMessage}
                  </div>
                )}

                <div style={styles.formActions}>
                  {formStep === 2 && (
                    <button type="button" style={styles.formBackBtn}
                      onClick={() => { setFormStep(1); setFormMessage(''); setFormStatus('idle'); }}>
                      ← Retour
                    </button>
                  )}
                  <button type="submit" style={{
                    ...styles.formButton,
                    opacity: formStatus === 'loading' ? 0.7 : 1,
                    flex: 1,
                  }}
                    disabled={formStatus === 'loading'}>
                    {formStatus === 'loading' ? 'Envoi en cours...'
                      : formStep === 1 ? 'Continuer →'
                      : 'Lancer ma recherche gratuite →'}
                  </button>
                </div>
                <p style={styles.formDisclaimer}>
                  🔒 Donnees securisees et traitees conformement a la LPD
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div className="footer-grid" style={styles.footerMain}>
            <div style={styles.footerBrand}>
              <div style={styles.footerLogo}>
                <span style={{ color: '#c9a962', fontSize: '20px' }}>◆</span>
                <span style={styles.footerLogoText}>Swiss Heritage</span>
              </div>
              <p style={styles.footerDesc}>
                Service de recherche administrative d'avoirs de prevoyance professionnelle (LPP).
                Accompagnement personnalise de la recherche au rapatriement.
              </p>
              <p style={styles.footerLegal}>
                SwissEmpire2 Sarl (CHE-489.583.893)<br />
                Moutier, Suisse
              </p>
            </div>
            <div className="footer-links" style={styles.footerLinks}>
              <div style={styles.footerCol}>
                <h4 style={styles.footerColTitle}>Services</h4>
                <a href="#contact" style={styles.footerLink}>Recherche d'avoirs</a>
                <a href="#process" style={styles.footerLink}>Notre processus</a>
                <a href="#advantages" style={styles.footerLink}>Avantages</a>
                <a href="#faq" style={styles.footerLink}>FAQ</a>
              </div>
              <div style={styles.footerCol}>
                <h4 style={styles.footerColTitle}>Legal</h4>
                <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('cgu'); }} style={styles.footerLink}>Conditions generales</a>
                <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('privacy'); }} style={styles.footerLink}>Politique de confidentialite</a>
                <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('legal'); }} style={styles.footerLink}>Mentions legales</a>
                <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('privacy'); }} style={styles.footerLink}>Droit de suppression</a>
              </div>
              <div style={styles.footerCol}>
                <h4 style={styles.footerColTitle}>Contact</h4>
                <a href="mailto:info@swiss-heritage.ch" style={styles.footerLink}>info@swiss-heritage.ch</a>
                <a href="mailto:privacy@swiss-heritage.ch" style={styles.footerLink}>privacy@swiss-heritage.ch</a>
              </div>
            </div>
          </div>

          {/* Legal disclaimer */}
          <div style={styles.footerDisclaimer}>
            Swiss Heritage est un service de SwissEmpire2 Sarl (CHE-489.583.893), Moutier.
            Service de recherche administrative d'avoirs de prevoyance professionnelle (LPP).
            Ce service ne constitue pas du conseil financier au sens de la LSFIN.
            Pour tout conseil en placement, consultez un conseiller financier autorise FINMA.
          </div>

          <div style={styles.footerBottom}>
            <div style={styles.footerCopy}>
              &copy; {new Date().getFullYear()} SwissEmpire2 Sarl. Tous droits reserves.
            </div>
            <div style={styles.footerCerts}>
              <span style={styles.footerCert}>🔒 Conforme LPD</span>
              <span style={styles.footerCert}>🇨🇭 Hebergement Suisse</span>
              <span style={styles.footerCert}>🏦 Partenaire Kala</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ==============================
// STYLES
// ==============================
const styles = {
  container: {
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    color: '#1a1a2e',
    background: '#fafafa',
    overflowX: 'hidden',
  },

  // === NAVIGATION ===
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    padding: '16px 0',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  navContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoIconWrapper: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, rgba(201,169,98,0.2), rgba(201,169,98,0.05))',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(201,169,98,0.3)',
  },
  logoIcon: { fontSize: '18px', color: '#c9a962' },
  logoText: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '22px',
    fontWeight: '600',
    color: '#fff',
  },
  navLinks: { display: 'flex', gap: '32px' },
  navLink: {
    color: 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'color 0.2s',
    position: 'relative',
  },
  navCta: {
    background: 'linear-gradient(135deg, #c9a962 0%, #e8d5a3 100%)',
    color: '#0c192f',
    padding: '12px 24px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(201,169,98,0.3)',
    display: 'inline-flex',
    alignItems: 'center',
  },

  // === HERO ===
  hero: {
    position: 'relative',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a1628 0%, #0c192f 30%, #1a2d4a 60%, #0f2341 100%)',
    display: 'flex',
    alignItems: 'center',
    padding: '120px 24px 80px',
    overflow: 'hidden',
  },
  heroOrb1: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(201,169,98,0.12) 0%, transparent 70%)',
    top: '-200px',
    left: '-100px',
    animation: 'orbFloat1 15s ease-in-out infinite',
    filter: 'blur(40px)',
  },
  heroOrb2: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(74,222,128,0.08) 0%, transparent 70%)',
    bottom: '-150px',
    right: '-100px',
    animation: 'orbFloat2 18s ease-in-out infinite',
    filter: 'blur(50px)',
  },
  heroOrb3: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(201,169,98,0.06) 0%, transparent 70%)',
    top: '30%',
    right: '20%',
    animation: 'orbFloat1 12s ease-in-out 3s infinite',
    filter: 'blur(30px)',
  },
  heroPattern: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L30 60M0 30L60 30' stroke='rgba(255,255,255,0.02)' stroke-width='1'/%3E%3C/svg%3E")`,
    backgroundSize: '60px 60px',
  },
  heroInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 2,
  },
  heroContent: {
    maxWidth: '580px',
  },
  heroTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(201,169,98,0.12)',
    border: '1px solid rgba(201,169,98,0.25)',
    color: '#c9a962',
    padding: '10px 20px',
    borderRadius: '50px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '28px',
    letterSpacing: '0.5px',
    backdropFilter: 'blur(10px)',
  },
  heroTagDot: {
    width: '8px',
    height: '8px',
    background: '#c9a962',
    borderRadius: '50%',
    boxShadow: '0 0 10px rgba(201,169,98,0.5)',
    animation: 'pulse3d 2s infinite',
  },
  heroTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 'clamp(38px, 5vw, 56px)',
    fontWeight: '600',
    color: '#fff',
    lineHeight: '1.15',
    marginBottom: '24px',
  },
  heroTitleAccent: {
    background: 'linear-gradient(135deg, #c9a962, #e8d5a3, #c9a962)',
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: 'shimmer 3s ease-in-out infinite',
    fontStyle: 'italic',
  },
  heroSubtitle: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.75)',
    lineHeight: '1.7',
    marginBottom: '36px',
  },
  heroCtas: { display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    background: 'linear-gradient(135deg, #c9a962 0%, #e8d5a3 50%, #c9a962 100%)',
    backgroundSize: '200% auto',
    color: '#0c192f',
    padding: '18px 36px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '700',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 32px rgba(201,169,98,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
  },
  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    padding: '18px 36px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500',
    border: '1px solid rgba(255,255,255,0.15)',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  },
  btnArrow: { fontSize: '18px', transition: 'transform 0.3s' },
  heroTrust: { display: 'flex', gap: '24px', flexWrap: 'wrap' },
  trustItem: { display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '14px' },
  trustCheck: { color: '#4ade80', fontWeight: 'bold', fontSize: '16px' },
  heroVisual: {
    position: 'relative',
    perspective: '1000px',
  },
  heroCard: {
    width: '360px',
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.1)',
    overflow: 'hidden',
    boxShadow: '0 40px 100px rgba(0,0,0,0.4), 0 0 60px rgba(201,169,98,0.1)',
    transition: 'transform 0.4s ease',
    transformStyle: 'preserve-3d',
    animation: 'float 6s ease-in-out infinite',
    position: 'relative',
  },
  cardGlow: {
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'conic-gradient(from 0deg, transparent, rgba(201,169,98,0.1), transparent, rgba(201,169,98,0.05), transparent)',
    animation: 'spin3d 8s linear infinite',
    zIndex: 0,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    position: 'relative',
    zIndex: 1,
  },
  cardBadge: {
    background: 'rgba(201,169,98,0.15)',
    color: '#c9a962',
    padding: '6px 14px',
    borderRadius: '50px',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    border: '1px solid rgba(201,169,98,0.2)',
  },
  cardLogo: { color: '#c9a962', fontSize: '20px' },
  cardContent: { padding: '24px', position: 'relative', zIndex: 1 },
  cardLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '12px',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    fontWeight: '600',
  },
  cardAmount: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '38px',
    fontWeight: '600',
    color: '#4ade80',
    marginBottom: '16px',
    textShadow: '0 0 30px rgba(74,222,128,0.3)',
  },
  cardBar: {
    width: '100%',
    height: '4px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '2px',
    marginBottom: '20px',
    overflow: 'hidden',
  },
  cardBarFill: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, #4ade80, #c9a962)',
    borderRadius: '2px',
    animation: 'shimmer 2s ease-in-out infinite',
    backgroundSize: '200% auto',
  },
  cardDetails: { display: 'flex', gap: '24px' },
  cardDetail: { flex: 1 },
  detailLabel: { display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  detailValue: { color: '#fff', fontSize: '20px', fontWeight: '700' },
  cardFooter: {
    padding: '16px 24px',
    background: 'rgba(74,222,128,0.08)',
    borderTop: '1px solid rgba(74,222,128,0.15)',
    position: 'relative',
    zIndex: 1,
  },
  cardStatus: { display: 'flex', alignItems: 'center', gap: '8px', color: '#4ade80', fontSize: '13px', fontWeight: '500' },
  statusDot: {
    width: '8px',
    height: '8px',
    background: '#4ade80',
    borderRadius: '50%',
    boxShadow: '0 0 10px rgba(74,222,128,0.5)',
  },
  cardShadow: {
    position: 'absolute',
    bottom: '-20px',
    left: '10%',
    width: '80%',
    height: '40px',
    background: 'radial-gradient(ellipse, rgba(0,0,0,0.3), transparent 70%)',
    filter: 'blur(15px)',
  },

  // === STATS ===
  stats: {
    background: '#fff',
    padding: '70px 24px',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
  },
  statsContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '40px',
  },
  statItem: {
    textAlign: 'center',
    padding: '24px',
    borderRadius: '16px',
    transition: 'all 0.3s ease',
  },
  statIcon: {
    fontSize: '32px',
    marginBottom: '12px',
  },
  statValue: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '44px',
    fontWeight: '700',
    color: '#0c192f',
    lineHeight: '1',
  },
  statSuffix: { fontSize: '22px', color: '#c9a962', marginLeft: '2px' },
  statLabel: { marginTop: '10px', color: '#666', fontSize: '14px', lineHeight: '1.4' },

  // === SITUATIONS ===
  situationsSection: {
    background: '#fff',
    padding: '100px 24px 80px',
  },
  situationsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    justifyContent: 'center',
    maxWidth: '900px',
    margin: '0 auto',
  },
  situationChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#f8f6f0',
    border: '1px solid rgba(201,169,98,0.2)',
    borderRadius: '50px',
    padding: '14px 24px',
    fontSize: '15px',
    color: '#1a1a2e',
    fontWeight: '500',
    cursor: 'default',
    transition: 'all 0.3s ease, transform 0.4s ease, box-shadow 0.4s ease',
    transformStyle: 'preserve-3d',
  },
  situationIcon: { fontSize: '20px' },
  situationLabel: {},

  // === SHARED SECTION STYLES ===
  sectionInner: { maxWidth: '1100px', margin: '0 auto', textAlign: 'center' },
  sectionTag: {
    display: 'inline-block',
    background: 'rgba(201,169,98,0.1)',
    color: '#c9a962',
    padding: '10px 24px',
    borderRadius: '50px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '24px',
    letterSpacing: '0.5px',
  },
  sectionTagDark: {
    display: 'inline-block',
    background: 'rgba(201,169,98,0.15)',
    color: '#c9a962',
    padding: '10px 24px',
    borderRadius: '50px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '24px',
    letterSpacing: '0.5px',
  },
  sectionTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 'clamp(30px, 4vw, 44px)',
    fontWeight: '600',
    color: '#0c192f',
    lineHeight: '1.25',
    marginBottom: '20px',
  },
  sectionSubtitle: {
    color: '#666',
    fontSize: '17px',
    lineHeight: '1.7',
    maxWidth: '700px',
    margin: '0 auto 50px',
  },
  highlight: { color: '#c9a962', fontStyle: 'italic' },
  highlightGold: { color: '#c9a962', fontStyle: 'italic' },

  // === PROCESS ===
  process: {
    background: 'linear-gradient(160deg, #0a1628 0%, #0c192f 40%, #1a2d4a 100%)',
    padding: '100px 24px',
  },
  processTitleH2: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 'clamp(30px, 4vw, 44px)',
    fontWeight: '600',
    color: '#fff',
    lineHeight: '1.25',
    marginBottom: '60px',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '24px',
  },
  stepCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '36px 24px 28px',
    position: 'relative',
    textAlign: 'center',
    transition: 'all 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease',
    transformStyle: 'preserve-3d',
  },
  stepNumBadge: {
    position: 'absolute',
    top: '-14px',
    left: '24px',
    background: 'linear-gradient(135deg, #c9a962, #e8d5a3)',
    color: '#0c192f',
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '800',
    boxShadow: '0 4px 15px rgba(201,169,98,0.3)',
  },
  stepIconLarge: { fontSize: '44px', marginBottom: '16px' },
  stepTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '20px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '12px',
  },
  stepDesc: { color: 'rgba(255,255,255,0.65)', fontSize: '14px', lineHeight: '1.65', marginBottom: '16px' },
  stepDetail: {
    color: 'rgba(201,169,98,0.6)',
    fontSize: '12px',
    fontStyle: 'italic',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    paddingTop: '12px',
  },

  // === ADVANTAGES ===
  advantages: {
    background: '#fff',
    padding: '100px 24px',
  },
  advantagesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  },
  advantageCard: {
    background: '#fafafa',
    border: '1px solid rgba(0,0,0,0.06)',
    borderRadius: '20px',
    padding: '36px 28px',
    textAlign: 'center',
    transition: 'all 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease',
    transformStyle: 'preserve-3d',
  },
  advantageIconWrapper: {
    width: '64px',
    height: '64px',
    background: 'linear-gradient(135deg, rgba(201,169,98,0.1), rgba(201,169,98,0.05))',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    margin: '0 auto 20px',
    border: '1px solid rgba(201,169,98,0.15)',
  },
  advantageTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '20px',
    fontWeight: '600',
    color: '#0c192f',
    marginBottom: '12px',
  },
  advantageDesc: { color: '#666', fontSize: '14px', lineHeight: '1.65' },

  // === COMPARISON ===
  comparison: {
    background: 'linear-gradient(160deg, #0a1628 0%, #0c192f 40%, #1a2d4a 100%)',
    padding: '100px 24px',
  },
  comparisonTitleH2: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 'clamp(30px, 4vw, 44px)',
    fontWeight: '600',
    color: '#fff',
    lineHeight: '1.25',
    marginBottom: '50px',
  },
  comparisonTable: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '40px',
    maxWidth: '800px',
    margin: '0 auto 40px',
  },
  comparisonCol: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  comparisonColHighlight: {
    background: 'rgba(201,169,98,0.08)',
    borderRadius: '20px',
    border: '2px solid rgba(201,169,98,0.3)',
    overflow: 'hidden',
    animation: 'borderGlow 3s ease-in-out infinite',
  },
  comparisonHeader: { padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  comparisonHeaderHL: {
    padding: '20px',
    borderBottom: '1px solid rgba(201,169,98,0.2)',
    background: 'rgba(201,169,98,0.08)',
  },
  comparisonBad: { color: 'rgba(255,255,255,0.5)', fontSize: '16px', fontWeight: '600' },
  comparisonGood: { color: '#c9a962', fontSize: '16px', fontWeight: '600' },
  comparisonBody: { padding: '20px' },
  comparisonBodyHL: { padding: '20px' },
  comparisonItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    color: 'rgba(255,255,255,0.75)',
    fontSize: '14px',
    textAlign: 'left',
  },
  comparisonX: { color: '#ef4444', fontSize: '16px', fontWeight: 'bold', flexShrink: 0 },
  comparisonCheck: { color: '#4ade80', fontSize: '16px', fontWeight: 'bold', flexShrink: 0 },
  comparisonExample: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '32px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  exampleText: { color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '20px' },
  exampleResults: { display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '16px', flexWrap: 'wrap' },
  exampleBad: { color: 'rgba(255,255,255,0.5)', fontSize: '15px' },
  exampleGood: { color: '#4ade80', fontSize: '15px' },
  exampleDiff: { color: '#fff', fontSize: '18px', fontWeight: '600' },
  diffAmount: { color: '#c9a962', fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px' },

  // === TESTIMONIALS ===
  testimonials: {
    background: '#fff',
    padding: '100px 24px',
  },
  testimonialsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  },
  testimonialCard: {
    background: '#fafafa',
    border: '1px solid rgba(0,0,0,0.06)',
    borderRadius: '20px',
    padding: '32px',
    textAlign: 'left',
    transition: 'all 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease',
    transformStyle: 'preserve-3d',
  },
  testimonialStars: { color: '#c9a962', fontSize: '18px', marginBottom: '16px', letterSpacing: '2px' },
  testimonialText: { color: '#333', fontSize: '15px', lineHeight: '1.7', fontStyle: 'italic', marginBottom: '16px' },
  testimonialMeta: { marginBottom: '20px' },
  testimonialEmployers: {
    display: 'inline-block',
    background: 'rgba(201,169,98,0.1)',
    color: '#c9a962',
    padding: '4px 12px',
    borderRadius: '50px',
    fontSize: '12px',
    fontWeight: '600',
  },
  testimonialFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  testimonialAuthor: { display: 'flex', alignItems: 'center', gap: '12px' },
  testimonialAvatar: {
    width: '44px',
    height: '44px',
    background: 'linear-gradient(135deg, #0c192f, #1a2d4a)',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#c9a962',
    fontWeight: '600',
    fontSize: '16px',
  },
  testimonialName: { fontWeight: '600', color: '#0c192f', fontSize: '15px' },
  testimonialLocation: { color: '#888', fontSize: '13px' },
  testimonialAmount: { textAlign: 'right' },
  amountLabel: { color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  amountValue: { color: '#4ade80', fontWeight: '700', fontSize: '16px' },

  // === FAQ ===
  faq: {
    background: 'linear-gradient(160deg, #0a1628 0%, #0c192f 40%, #1a2d4a 100%)',
    padding: '100px 24px',
  },
  faqInner: { maxWidth: '800px', margin: '0 auto', textAlign: 'center' },
  faqTitleH2: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 'clamp(30px, 4vw, 44px)',
    fontWeight: '600',
    color: '#fff',
    lineHeight: '1.25',
    marginBottom: '50px',
  },
  faqList: { textAlign: 'left' },
  faqItem: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px',
    marginBottom: '12px',
    padding: '22px 28px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  faqItemOpen: {
    background: 'rgba(201,169,98,0.08)',
    border: '1px solid rgba(201,169,98,0.25)',
  },
  faqQuestion: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '500',
    gap: '16px',
  },
  faqToggle: {
    color: '#c9a962',
    fontSize: '24px',
    fontWeight: '300',
    transition: 'transform 0.3s ease',
    flexShrink: 0,
  },
  faqAnswer: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '15px',
    lineHeight: '1.7',
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // === CONTACT FORM ===
  cta: {
    background: '#fff',
    padding: '100px 24px',
  },
  ctaContent: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '80px',
    alignItems: 'flex-start',
  },
  ctaLeft: {},
  ctaTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 'clamp(30px, 4vw, 42px)',
    fontWeight: '600',
    color: '#0c192f',
    lineHeight: '1.25',
    marginBottom: '20px',
  },
  ctaTitleAccent: { color: '#c9a962', fontStyle: 'italic' },
  ctaSubtitle: { color: '#666', fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' },
  ctaFeatures: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  ctaFeature: { display: 'flex', alignItems: 'center', gap: '10px', color: '#333', fontSize: '14px' },
  ctaCheck: { color: '#4ade80', fontWeight: 'bold', fontSize: '16px' },
  ctaRight: {},

  // Form Card
  formCard: {
    background: '#fff',
    borderRadius: '24px',
    boxShadow: '0 30px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  formProgress: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0',
    padding: '20px 32px 0',
    background: 'linear-gradient(135deg, #0c192f, #1a2d4a)',
  },
  formProgressStep: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    transition: 'all 0.3s ease',
  },
  formProgressLine: {
    width: '60px',
    height: '3px',
    borderRadius: '2px',
    transition: 'all 0.3s ease',
  },
  formHeader: {
    background: 'linear-gradient(135deg, #0c192f, #1a2d4a)',
    padding: '20px 32px 28px',
  },
  formTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    color: '#fff',
    fontSize: '22px',
    fontWeight: '600',
    marginBottom: '6px',
  },
  formSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: '14px' },
  form: { padding: '28px 32px' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  formGroup: { marginBottom: '18px' },
  formLabel: {
    display: 'block',
    color: '#333',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '8px',
    letterSpacing: '0.3px',
  },
  formInput: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #eee',
    borderRadius: '10px',
    fontSize: '15px',
    transition: 'all 0.3s ease',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#fafafa',
  },
  consentBox: {
    background: '#f8f6f0',
    border: '1px solid rgba(201,169,98,0.2)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '18px',
  },
  consentLabel: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    cursor: 'pointer',
  },
  consentCheckbox: {
    marginTop: '3px',
    width: '18px',
    height: '18px',
    flexShrink: 0,
    accentColor: '#c9a962',
  },
  consentText: {
    color: '#555',
    fontSize: '12px',
    lineHeight: '1.6',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  formBackBtn: {
    padding: '16px 24px',
    borderRadius: '10px',
    border: '2px solid #eee',
    background: '#fff',
    color: '#666',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  formButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #c9a962 0%, #e8d5a3 100%)',
    color: '#0c192f',
    padding: '16px 32px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(201,169,98,0.3)',
  },
  formDisclaimer: {
    textAlign: 'center',
    color: '#999',
    fontSize: '12px',
    marginTop: '16px',
  },
  formMessage: {
    padding: '14px 18px',
    borderRadius: '10px',
    fontSize: '14px',
    marginBottom: '16px',
    textAlign: 'center',
    fontWeight: '500',
  },
  formMessageSuccess: {
    background: '#d1fae5',
    color: '#065f46',
    border: '1px solid #6ee7b7',
  },
  formMessageError: {
    background: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
  },

  // === FOOTER ===
  footer: {
    background: '#0a1628',
    padding: '80px 24px 40px',
  },
  footerContent: { maxWidth: '1100px', margin: '0 auto' },
  footerMain: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 2fr',
    gap: '80px',
    marginBottom: '40px',
  },
  footerBrand: {},
  footerLogo: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
  footerLogoText: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '20px',
    fontWeight: '600',
    color: '#fff',
  },
  footerDesc: { color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: '1.7', marginBottom: '16px' },
  footerLegal: { color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: '1.6' },
  footerLinks: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '40px',
  },
  footerCol: { display: 'flex', flexDirection: 'column', gap: '12px' },
  footerColTitle: { color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '8px' },
  footerLink: {
    color: 'rgba(255,255,255,0.5)',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.2s',
  },
  footerDisclaimer: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '20px 24px',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '12px',
    lineHeight: '1.7',
    marginBottom: '30px',
    textAlign: 'center',
  },
  footerBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '24px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    flexWrap: 'wrap',
    gap: '16px',
  },
  footerCopy: { color: 'rgba(255,255,255,0.4)', fontSize: '13px' },
  footerCerts: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  footerCert: { color: 'rgba(255,255,255,0.4)', fontSize: '12px' },

  // === LEGAL PAGES ===
  legalPage: {
    background: '#fff',
    minHeight: '100vh',
    paddingTop: '100px',
    paddingBottom: '80px',
  },
  legalContainer: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 24px',
  },
  legalBack: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    color: '#c9a962',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '32px',
    transition: 'opacity 0.2s',
  },
  legalTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 'clamp(32px, 5vw, 48px)',
    fontWeight: '600',
    color: '#0c192f',
    lineHeight: '1.2',
    marginBottom: '40px',
    paddingBottom: '24px',
    borderBottom: '2px solid rgba(201,169,98,0.2)',
  },
  legalContent: {},
  legalMeta: {
    color: '#888',
    fontSize: '14px',
    fontStyle: 'italic',
    marginBottom: '32px',
    paddingBottom: '16px',
    borderBottom: '1px solid #eee',
  },
  legalH2: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '22px',
    fontWeight: '600',
    color: '#0c192f',
    marginTop: '36px',
    marginBottom: '16px',
  },
  legalP: {
    color: '#444',
    fontSize: '15px',
    lineHeight: '1.8',
    marginBottom: '16px',
  },
  legalUl: {
    paddingLeft: '24px',
    marginBottom: '16px',
  },
  legalLi: {
    color: '#444',
    fontSize: '15px',
    lineHeight: '1.8',
    marginBottom: '8px',
  },
  legalLink: {
    color: '#c9a962',
    textDecoration: 'underline',
  },
};
