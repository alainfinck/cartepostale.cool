
import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Politique de Confidentialité',
    description: 'Politique de confidentialité et protection des données personnelles',
}

export default function ConfidentialitePage() {
    return (
        <>
            <h2>Politique de Confidentialité</h2>

            <p>
                La protection de vos données personnelles est une priorité pour CartePostale.cool.
            </p>

            <h3>1. Collecte des données</h3>
            <p>
                Nous collectons les informations que vous nous fournissez lors de la création de votre compte ou de votre commande : nom, prénom, adresse email, adresse postale des destinataires, et vos photos.
            </p>

            <h3>2. Utilisation des données</h3>
            <p>
                Vos données sont utilisées pour :
            </p>
            <ul>
                <li>Gérer et expédier vos commandes</li>
                <li>Vous informer du statut de vos envois</li>
                <li>Améliorer nos services</li>
                <li>Vous envoyer des offres promotionnelles (si vous l&apos;avez accepté)</li>
            </ul>

            <h3>3. Conservation des données</h3>
            <p>
                Les photos téléchargées sont conservées le temps nécessaire à la création et à la diffusion de vos cartes virtuelles, puis supprimées de nos serveurs de production sous 30 jours, sauf si vous choisissez de les conserver dans votre album personnel.
            </p>
            <p>
                Les données de facturation sont conservées conformément aux obligations légales (10 ans).
            </p>

            <h3>4. Vos droits (RGPD)</h3>
            <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ces droits, contactez-nous à : privacy@cartepostale.cool.
            </p>

            <h3>5. Cookies</h3>
            <p>
                Nous utilisons des cookies pour assurer le bon fonctionnement du site (session, panier) et mesurer notre audience. Vous pouvez paramétrer vos préférences via le lien &quot;Cookies&quot; en bas de page.
            </p>
        </>
    )
}
