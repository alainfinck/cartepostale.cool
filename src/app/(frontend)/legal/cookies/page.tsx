
import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Politique des Cookies',
    description: 'Informations sur l\'utilisation des cookies sur CartePostale.cool',
}

export default function CookiesPage() {
    return (
        <>
            <h2>Politique des Cookies</h2>

            <p>
                Lors de votre consultation de notre site CartePostale.cool, des cookies sont déposés sur votre ordinateur, votre mobile ou votre tablette.
            </p>

            <h3>1. Qu&apos;est-ce qu&apos;un cookie ?</h3>
            <p>
                Un cookie est un petit fichier texte déposé sur votre terminal lors de la visite d&apos;un site ou de la consultation d&apos;une publicité. Ils ont notamment pour but de collecter des informations relatives à votre navigation sur les sites et de vous adresser des services personnalisés.
            </p>

            <h3>2. Les cookies que nous utilisons</h3>
            <p>
                Nous utilisons différentes catégories de cookies :
            </p>
            <ul>
                <li><strong>Cookies strictement nécessaires :</strong> Ils sont indispensables au fonctionnement du site (gestion de la session, panier d&apos;achat).</li>
                <li><strong>Cookies de performance :</strong> Ils nous permettent de connaître l&apos;utilisation et les performances de notre site et d&apos;en améliorer le fonctionnement (via Google Analytics par exemple).</li>
                <li><strong>Cookies fonctionnels :</strong> Ils permettent de mémoriser vos choix (langue, identifiants) pour faciliter votre navigation.</li>
            </ul>

            <h3>3. Comment gérer les cookies ?</h3>
            <p>
                Vous pouvez à tout moment choisir de désactiver ces cookies. Votre navigateur peut également être paramétré pour vous signaler les cookies qui sont déposés dans votre ordinateur et vous demander de les accepter ou non.
            </p>
            <p>
                Vous pouvez accepter ou refuser les cookies au cas par cas ou bien les refuser systématiquement une fois pour toutes.
            </p>
            <p>
                Nous vous rappelons que le paramétrage est susceptible de modifier vos conditions d&apos;accès à nos services nécessitant l&apos;utilisation de cookies.
            </p>

            <h3>4. Plus d&apos;informations</h3>
            <p>
                Pour plus d&apos;informations sur les cookies, vous pouvez vous rendre sur le site de la CNIL : <a href="https://www.cnil.fr/fr/cookies-les-outils-pour-les-maitriser" target="_blank" rel="noopener noreferrer">https://www.cnil.fr/fr/cookies-les-outils-pour-les-maitriser</a>.
            </p>
        </>
    )
}
