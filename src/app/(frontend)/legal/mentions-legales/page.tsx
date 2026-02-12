
import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Mentions Légales',
    description: 'Mentions légales de CartePostale.cool',
}

export default function MentionsLegalesPage() {
    return (
        <>
            <h2>Mentions Légales</h2>

            <h3>1. Éditeur du site</h3>
            <p>
                Le site <strong>CartePostale.cool</strong> est édité par la société [NOM_SOCIETE], [FORME_JURIDIQUE] au capital de [MONTANT] euros, immatriculée au Registre du Commerce et des Sociétés de [VILLE] sous le numéro [SIRET].
            </p>
            <p>
                <strong>Siège social :</strong><br />
                [ADRESSE_COMPLETE]<br />
                [CODE_POSTAL] [VILLE]<br />
                France
            </p>
            <p>
                <strong>Numéro de TVA intracommunautaire :</strong> [NUMERO_TVA]<br />
                <strong>Directeur de la publication :</strong> [NOM_DIRECTEUR]
            </p>
            <p>
                <strong>Contact :</strong><br />
                Email : hello@cartepostale.cool<br />
                Téléphone : [TELEPHONE]
            </p>

            <h3>2. Hébergement</h3>
            <p>
                Le site est hébergé par [NOM_HEBERGEUR] (ex: Vercel Inc.).<br />
                Adresse : [ADRESSE_HEBERGEUR]<br />
                Site web : [URL_HEBERGEUR]
            </p>

            <h3>3. Propriété intellectuelle</h3>
            <p>
                L&apos;ensemble de ce site relève de la législation française et internationale sur le droit d&apos;auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
            </p>
        </>
    )
}
