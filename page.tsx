'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/header'
import CategoryTags from '@/components/category-tags'
import ConversionSection from '@/components/conversion-section'
import { conversionCategories, convertUnits, UNIT_SETS, CATEGORY_KEY_MAP, type CategoryType } from '@/lib/converter'

interface ConversionState {
  input: string
  results: Array<{ values: number[]; unit: string }>
  error: string
  selectedUnit: string
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('Length')
  
  const [conversions, setConversions] = useState<Record<string, ConversionState>>(() => {
    const initial: Record<string, ConversionState> = {}
    conversionCategories.forEach(cat => {
      initial[cat] = { input: '', results: [], error: '', selectedUnit: '' }
    })
    initial['Length'] = { input: '1', results: [], error: '', selectedUnit: 'cm' }
    return initial
  })

  useEffect(() => {
    const runConversion = () => {
      const state = conversions[activeCategory]
      
      // Ensure default unit is set
      if (!state.selectedUnit) {
        const units = UNIT_SETS[activeCategory as keyof typeof UNIT_SETS] || []
        if (units.length > 0) {
          setConversions(prev => ({
            ...prev,
            [activeCategory]: { ...prev[activeCategory], selectedUnit: units[0] }
          }))
        }
        return
      }
      
      const input = state.input.trim()
      const selectedUnit = state.selectedUnit
      
      // If input is empty or whitespace, clear results and error
      if (!input) {
        setConversions(prev => ({
          ...prev,
          [activeCategory]: { ...prev[activeCategory], results: [], error: '' }
        }))
        return
      }

      // Parse input: split on spaces/asterisks and filter valid numbers
      const tokens = input.split(/[\s*]+/).filter(Boolean)
      const nums = tokens.map(t => Number(t)).filter(v => !Number.isNaN(v))
      
      // If no valid numbers found, set error
      if (nums.length === 0) {
        setConversions(prev => ({
          ...prev,
          [activeCategory]: { 
            ...prev[activeCategory], 
            error: 'Unable to parse input. Try formats like: 50, 50 60 70',
            results: []
          }
        }))
        return
      }

      // Valid input: run conversion
      try {
        const results = convertUnits(input, activeCategory, selectedUnit)
        setConversions(prev => ({
          ...prev,
          [activeCategory]: { 
            ...prev[activeCategory], 
            results,
            error: ''
          }
        }))
      } catch (err) {
        console.error('[v0] Conversion error:', err)
        setConversions(prev => ({
          ...prev,
          [activeCategory]: { 
            ...prev[activeCategory], 
            error: 'Invalid input. Please check your format and try again.',
            results: []
          }
        }))
      }
    }

    runConversion()
  }, [activeCategory, conversions[activeCategory]?.input, conversions[activeCategory]?.selectedUnit])

  const handleCategoryToggle = (category: CategoryType) => {
    setActiveCategory(category)
  }

  const handleInputChange = (categoryKey: string, value: string) => {
    setConversions(prev => ({
      ...prev,
      [categoryKey]: { ...prev[categoryKey], input: value }
    }))
  }

  const handleUnitSelect = (categoryKey: string, unit: string) => {
    setConversions(prev => ({
      ...prev,
      [categoryKey]: { ...prev[categoryKey], selectedUnit: unit }
    }))
  }

  const handleClear = (categoryKey: string) => {
    setConversions(prev => ({
      ...prev,
      [categoryKey]: { input: '', results: [], error: '', selectedUnit: prev[categoryKey].selectedUnit }
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <CategoryTags
            selectedCategories={[activeCategory]}
            onCategoryToggle={handleCategoryToggle}
          />

          <div className="pb-12 mt-8">
            <div className="space-y-5">
              <ConversionSection
                categoryLabel={activeCategory}
                categoryKey={activeCategory}
                input={conversions[activeCategory].input}
                error={conversions[activeCategory].error}
                selectedUnit={conversions[activeCategory].selectedUnit}
                results={conversions[activeCategory].results}
                onInputChange={(value) => handleInputChange(activeCategory, value)}
                onUnitSelect={(unit) => handleUnitSelect(activeCategory, unit)}
                onClear={() => handleClear(activeCategory)}
              />
            </div>
          </div>

          <section className="max-w-5xl mx-auto mt-10 mb-16 px-4">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-3">
                  What is MultiUnitConverter.com?
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  MultiUnitConverter.com is a free online unit conversion tool that helps you convert between different units of measurement instantly. Whether you need to convert length, weight, volume, or any other unit type, our converter provides accurate results with a clean, modern interface.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-3">
                  Unit types you can convert
                </h2>
                <p className="text-foreground/80 leading-relaxed mb-3">
                  Our converter supports 18 different categories of units, covering virtually all common conversion needs:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-foreground/80 leading-relaxed">
                  <li>Length: Convert between meters, feet, inches, kilometers, miles, and more</li>
                  <li>Weight: Convert kilograms, pounds, ounces, grams, and other mass units</li>
                  <li>Volume: Convert liters, gallons, milliliters, cubic meters, and more</li>
                  <li>Area: Convert square meters, acres, hectares, and other area measurements</li>
                  <li>Speed: Convert between km/h, mph, m/s, knots, and other velocity units</li>
                  <li>Temperature: Convert Celsius, Fahrenheit, and Kelvin</li>
                  <li>And 12 more categories including Pressure, Energy, Data, Time, Force, Power, and more</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-3">
                  How to use this unit converter
                </h2>
                <ol className="list-decimal list-inside space-y-2 text-foreground/80 leading-relaxed">
                  <li>Select your category from the tabs at the top (Length, Weight, Volume, etc.)</li>
                  <li>Enter one or multiple numbers in the input field</li>
                  <li>Choose the unit that applies to your input values by clicking one of the unit chips</li>
                  <li>View instant conversion results for all other units in that category</li>
                  <li>Click any result to copy it to your clipboard</li>
                </ol>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-3">
                  Why use MultiUnitConverter.com?
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  Our unit converter is designed to be fast, accurate, and easy to use. With support for multiple values at once, instant conversion as you type, and a clean interface that works on any device, you can complete your conversions quickly without unnecessary complexity. No sign-up required, no ads, just straightforward unit conversion whenever you need it.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
