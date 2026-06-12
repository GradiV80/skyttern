import React from 'react';
import { ExternalLink, Landmark, Target, ShieldCheck, Scale, Compass } from 'lucide-react';

export default function RulesTab() {
  const customRules = [
    {
      title: 'T96 Feltskyting',
      pdfLink: 'https://www.skyting.no/wp-content/uploads/2019/11/t96-reglementskapittel-versjon-5.pdf',
      distance: '11, 15, og 25 meter',
      targets: 'Figurskiver (internasjonale standard feltfigurer)',
      stance: 'Stående fri eller stående 1 hånd (avhengig av serie)',
      description: 'Nasjonalt feltprogram bestående av 16 serier à 5 skudd. Det skytes på varierende avstander med ulik støtte og skytetid, noe som setter krav til allsidighet hos skytteren. Svært populært program under Norges Skytterforbund (NSF).',
      summary: [
        'Totalt 16 serier (totalt 80 skudd). Ingen felles prøveserie.',
        '11 meter: Sone 1 (stående fri, stående 1-hånd og tette serier ned til 10 sek)',
        '15 meter: Sone 2 (stående fri og 1-hånd, krevende 10 sekunders skytetider)',
        '25 meter: Sone 3 (stående fri, ulik skytetid opp til 150 sek)',
        'Poengskåring: Standard ring- og innertier (0-10 poeng pr. skudd)'
      ]
    },
    {
      title: 'NAIS Fin/Grov',
      pdfLink: 'https://www.nrof.no/wp-content/uploads/2019/08/NAIS-pistol-3.pdf',
      distance: '25 meter',
      targets: 'Internasjonal finpistolsive (presisjon og duell)',
      stance: 'Stående 1-hånd eller stående fri (avhengig av lokale forbundsregler)',
      description: 'Norsk Avdeling av International Shooting Union (NAIS) er et klassisk og tilgjengelig skyteprogram som har som formål å fremme skytteferdigheter med sivile og militære håndvåpen.',
      summary: [
        'Prøveserie: 150 sekunder på 5 skudd.',
        'Presisjonsfase: 2 serier à 150 sekunder.',
        'Duellfase: 2 serier hvor skiven er synlig i kun 3 sekunder per skudd.',
        'Hurtigfase: 1 serie på 20 sekunder og 1 serie på 10 sekunder.',
        'Kapasitet: Totalt 30 tellende skudd, maks poengsum 300.'
      ]
    },
    {
      title: 'Hurtigpistol',
      pdfLink: 'https://www.skyting.no/wp-content/uploads/2020/09/forslag-til-nytt-reglement-hurtig-nais-luft.pdf',
      distance: '25 meter',
      targets: 'Internasjonal duellskive (svart felt)',
      stance: 'Stående 1-hånd',
      description: 'En intens og teknisk krevende øvelse der skytetiden reduseres for hver fase. Her gjelder det å beholde avtrekkskontroll og siktebilde under gradvis økende tidspress.',
      summary: [
        'Prøveserie: 10 sekunder skytetid.',
        'Fase 1: 4 serier på 10 sekunder skytetid.',
        'Fase 2: 4 serier på 8 sekunder skytetid.',
        'Fase 3: 4 serier på 6 sekunder skytetid.',
        'Totalt 60 tellende skudd, maksimalt 600 poeng.'
      ]
    },
    {
      title: 'Standardpistol',
      pdfLink: '', // No link was requested or specified in the prompt
      distance: '25 meter',
      targets: 'Internasjonal presisjonsskive',
      stance: 'Stående 1-hånd',
      description: 'ISSF Standardpistol er en av de eldste og mest prestisjefylte øvelsene i pistolsporten. Programmet tester både ekstrem presisjon, middels hurtighet og ekstrem hurtighet.',
      summary: [
        'Prøveserie: 150 sekunder skytetid.',
        'Fase 1: 4 serier på 150 sekunder (rolig og meget presis oppbygging).',
        'Fase 2: 4 serier på 20 sekunder (middels tempo, krever god rytme).',
        'Fase 3: 4 serier på 10 sekunder (meget høyt tempo, krever raske kontrollerte avtrekk).',
        'Totalt 60 tellende skudd, maksimalt 600 poeng.'
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in" id="rules-tab-container">
      {/* Rules welcome card */}
      <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
        <h2 className="text-lg font-black text-white tracking-tight">Gjeldende Reglement</h2>
        <p className="text-xs text-zinc-400">
          Oversikt over skytetider, standplassregler og offisielle lenker til Norske Skytterreglementer.
        </p>
      </div>

      {/* Grid of rules card decks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="rules-cards-deck">
        {customRules.map((rule, idx) => (
          <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between" id={`rule-card-item-${idx}`}>
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
                    <Target size={15} />
                  </div>
                  <h3 className="text-base font-black text-white leading-tight">
                    {rule.title}
                  </h3>
                </div>
                {rule.pdfLink ? (
                  <a
                    href={rule.pdfLink}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-350 font-bold text-xs transition-colors cursor-pointer"
                    title="Vis fullstendig PDF-reglement for denne skytesporten"
                  >
                    Offisielt PDF
                    <ExternalLink size={11} />
                  </a>
                ) : (
                  <span className="text-[10px] font-bold text-zinc-500 font-mono">ISSF INTERNASJONALT</span>
                )}
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                {rule.description}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs mb-4 border-t border-b border-zinc-800/80 py-3 font-mono">
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 block uppercase tracking-wider">Avstand</span>
                  <span className="text-zinc-200 font-bold">{rule.distance}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 block uppercase tracking-wider">Skive</span>
                  <span className="text-zinc-200 font-bold">{rule.targets}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2 font-mono">Viktige Holdepunkter</span>
                <ul className="space-y-1.5 list-none">
                  {rule.summary.map((point, pIdx) => (
                    <li key={pIdx} className="text-xs text-zinc-300 flex items-start gap-1.5">
                      <span className="text-emerald-400 font-black mt-0.5">•</span>
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Regulatory footnote badge */}
            <div className="bg-zinc-950 border-t border-zinc-850 p-3.5 flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
              <Scale size={13} className="text-zinc-550" />
              <span>Samsvarer med standardene godkjent av NSF og NROF.</span>
            </div>
          </div>
        ))}
      </div>

      {/* General range standards alert box */}
      <div className="bg-zinc-950 text-zinc-200 rounded-2xl p-5 border border-zinc-800 space-y-2" id="range-conduct-notice">
        <div className="flex items-center gap-2">
          <Landmark size={18} className="text-emerald-400" />
          <h4 className="font-bold text-sm text-white">Generell Sikkerhet på Standplass</h4>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
          Husk alltid de fire gylne reglene for våpenbehandling på skytebana:
          Behandle alltid skytevåpen som om de er ladet. Pek aldri munningen mot noe du ikke har til hensikt å skyte på. 
          Hold fingeren av avtrekkeren til du har siktebilde rett på målet. Vær helt sikker på målet og hva som ligger bak og rundt det. 
          Slidestykke eller tønne skal alltid holdes åpen inntil standplassleder befaler «Lading tillatt!».
        </p>
      </div>

    </div>
  );
}
