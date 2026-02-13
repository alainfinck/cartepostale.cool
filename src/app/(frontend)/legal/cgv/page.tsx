
import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Conditions Générales de Vente',
    description: 'Conditions Générales de Vente de CartePostale.cool',
}

export default function CGVPage() {
    return (
        <>
            <h2>Conditions Générales de Vente</h2>

            <p className="text-sm text-stone-500 italic">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

            <h3>1. Objet</h3>
            <p>
                Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre le site CartePostale.cool (ci-après le &quot;Vendeur&quot;) et toute personne physique ou morale (ci-après l&apos;&quot;Acheteur&quot;) souhaitant effectuer un achat via le site internet.
            </p>

            <h3>2. Produits et Services</h3>
            <p>
                Le Vendeur propose un service de création, impression et expédition de cartes postales personnalisées à partir de photos et textes fournis par l&apos;Utilisateur.
            </p>

            <h3>3. Prix</h3>
            <p>
                Les prix de nos produits sont indiqués en euros toutes taxes comprises (TTC), sauf indication contraire et hors frais de traitement et d&apos;expédition. Le Vendeur se réserve le droit de modifier ses prix à tout moment, mais le produit sera facturé sur la base du tarif en vigueur au moment de la validation de la commande.
            </p>

            <h3>4. Commandes</h3>
            <p>
                Vous pouvez passer commande sur le site internet CartePostale.cool. Toute commande passée sur notre site suppose l&apos;adhésion aux présentes Conditions Générales. Toute confirmation de commande entraîne votre adhésion pleine et entière aux présentes conditions générales de vente, sans exception ni réserve.
            </p>

            <h3>5. Paiement</h3>
            <p>
                Le fait de valider votre commande implique pour vous l&apos;obligation de payer le prix indiqué. Le règlement de vos achats s&apos;effectue par carte bancaire grâce au système sécurisé de notre prestataire Stripe.
            </p>

            <h3>6. Rétractation</h3>
            <p>
                Conformément aux dispositions de l&apos;article L.121-21-8 du Code de la Consommation, le droit de rétractation ne s&apos;applique pas à la fourniture de biens confectionnés selon les spécifications du consommateur ou nettement personnalisés. En conséquence, aucun droit de rétractation ne peut être exercé pour les commandes de cartes postales personnalisées.
            </p>

            <h3>7. Livraison</h3>
            <p>
                Les produits sont livrés à l&apos;adresse de livraison indiquée au cours du processus de commande, dans le délai indiqué sur la page de validation de la commande. En cas de retard d&apos;expédition, un mail vous sera adressé pour vous informer d&apos;une éventuelle conséquence sur le délai de livraison qui vous a été indiqué.
            </p>

            <h3>8. Garantie</h3>
            <p>
                Tous nos produits bénéficient de la garantie légale de conformité et de la garantie des vices cachés, prévues par les articles 1641 et suivants du Code civil. En cas de non-conformité d&apos;un produit vendu, il pourra être retourné, échangé ou remboursé.
            </p>

            <h3>9. Responsabilité</h3>
            <p>
                Le Vendeur ne saurait être tenu pour responsable des dommages résultant d&apos;une mauvaise utilisation du produit acheté. Enfin la responsabilité du Vendeur ne saurait être engagée pour tous les inconvénients ou dommages inhérents à l&apos;utilisation du réseau Internet, notamment une rupture de service, une intrusion extérieure ou la présence de virus informatiques.
            </p>
        </>
    )
}
