import React from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircleIcon,
  UsersIcon,
  GlobeAltIcon,
  HeartIcon,
  TrophyIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'

const About: React.FC = () => {
  const values = [
    {
      icon: HeartIcon,
      title: 'Passion',
      description: 'Nous sommes passionnés par l\'excellence et la qualité de nos produits.'
    },
    {
      icon: UsersIcon,
      title: 'Communauté',
      description: 'Nous construisons une communauté forte autour de nos clients.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Innovation',
      description: 'Nous innovons constamment pour améliorer votre expérience.'
    },
    {
      icon: TrophyIcon,
      title: 'Excellence',
      description: 'Nous nous efforçons d\'atteindre l\'excellence dans tout ce que nous faisons.'
    }
  ]

  const stats = [
    { label: 'Clients satisfaits', value: '10,000+' },
    { label: 'Produits disponibles', value: '500+' },
    { label: 'Années d\'expérience', value: '5+' },
    { label: 'Pays desservis', value: '25+' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              À propos de{' '}
              <span className="text-primary-600">Jaayma</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              Nous sommes une entreprise passionnée qui s'engage à offrir les meilleurs produits 
              et services à nos clients partout dans le monde.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Notre Histoire
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Fondée en 2019, Jaayma est née de la vision de créer une plateforme e-commerce 
                qui met l'accent sur la qualité, l'authenticité et l'expérience client exceptionnelle.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Depuis nos débuts, nous avons travaillé sans relâche pour construire une communauté 
                de clients fidèles et satisfaits, en proposant une sélection soigneusement choisie 
                de produits de qualité supérieure.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
                  <span className="text-gray-700">Produits authentiques</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
                  <span className="text-gray-700">Service client 24/7</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop"
                  alt="Notre équipe"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos Chiffres
            </h2>
            <p className="text-lg text-gray-600">
              Des résultats qui parlent d'eux-mêmes
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos Valeurs
            </h2>
            <p className="text-lg text-gray-600">
              Les principes qui guident notre entreprise
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <value.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <LightBulbIcon className="mx-auto h-12 w-12 text-white mb-6" />
            <h2 className="text-3xl font-bold text-white mb-6">
              Notre Mission
            </h2>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Révolutionner l'expérience d'achat en ligne en offrant des produits de qualité, 
              un service client exceptionnel et une plateforme intuitive qui répond aux besoins 
              de nos clients modernes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Rejoignez notre communauté
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Découvrez pourquoi des milliers de clients nous font confiance pour leurs achats en ligne.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/products"
                className="btn-primary inline-flex items-center justify-center px-8 py-3 text-lg"
              >
                Découvrir nos produits
              </a>
              <a
                href="/contact"
                className="btn-secondary inline-flex items-center justify-center px-8 py-3 text-lg"
              >
                Nous contacter
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default About
