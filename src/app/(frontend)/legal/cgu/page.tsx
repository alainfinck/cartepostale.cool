
import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'CGU',
    description: 'Conditions Générales d\'Utilisation de CartePostale.cool',
}

export default function CGUPage() {
    return (
        <>
            <h2>Conditions Générales d&apos;Utilisation</h2>

            <p className="text-sm text-stone-500 italic">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

            <h3>1. Objet</h3>
            <p>
                Les présentes Conditions Générales ont pour objet de définir les modalités de mise à disposition des services du site CartePostale.cool, ci-après nommé « le Service » et les conditions d&apos;utilisation du Service par l&apos;Utilisateur.
            </p>

            <h3>2. Description du Service</h3>
            <p>
                Le Service permet aux Utilisateurs de créer, personnaliser et envoyer des cartes postales virtuelles (numériques) à partir de photos et vidéos numériques via une interface web ou mobile.
            </p>

            <h3>3. Tarifs et Paiement</h3>
            <p>
                Les prix sont indiqués en euros toutes taxes comprises (TTC). Le paiement est exigible immédiatement à la commande pour les options Premium. Le règlement s&apos;effectue par carte bancaire via notre prestataire de paiement sécurisé (Stripe).
            </p>

            <h3>4. Livraison numérique</h3>
            <p>
                La livraison des cartes virtuelles est instantanée dès la validation de la création par l&apos;Utilisateur. Un lien unique est généré et peut être partagé par SMS, email ou réseaux sociaux.
            </p>

            <h3>5. Droit de rétractation</h3>
            <p>
                Conformément à l&apos;article L.221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour les contrats de fourniture de biens confectionnés selon les spécifications du consommateur ou nettement personnalisés (ce qui est le cas des cartes postales personnalisées avec vos photos et textes).
            </p>

            <h3>6. Responsabilité</h3>
            <p>
                L&apos;Utilisateur est seul responsable du contenu (photos et textes) des cartes envoyées. Il s&apos;interdit d&apos;envoyer des contenus à caractère illicite, haineux, diffamatoire ou portant atteinte aux droits de tiers.
            </p>
        </>
    )
}
