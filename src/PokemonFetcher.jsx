import React, { useState, useEffect } from 'react';
import './PokemonFetcher.css';

// 🎨 Colores por tipo
const tipoColores = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

const PokemonFetcher = () => {
  const [pokemones, setPokemones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [tiposDisponibles, setTiposDisponibles] = useState([]);

  useEffect(() => {
    fetchAleatorios();
    fetchTiposDisponibles();
  }, []);

  const fetchAleatorios = async () => {
    try {
      setCargando(true);
      setError(null);
      const fetchedPokemones = [];
      const pokemonIds = new Set();

      while (pokemonIds.size < 4) {
        const randomId = Math.floor(Math.random() * 898) + 1;
        pokemonIds.add(randomId);
      }

      const idsArray = Array.from(pokemonIds);
      for (const id of idsArray) {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
        const data = await res.json();
        fetchedPokemones.push({
          id: data.id,
          nombre: data.name,
          imagen: data.sprites.front_default,
          tipos: data.types.map(t => t.type.name),
        });
      }
      setPokemones(fetchedPokemones);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const fetchTiposDisponibles = async () => {
    const res = await fetch('https://pokeapi.co/api/v2/type/');
    const data = await res.json();
    const tipos = data.results.map(tipo => tipo.name);
    setTiposDisponibles(tipos);
  };

  const buscarPorNombre = async () => {
    if (!busqueda.trim()) return;
    try {
      setCargando(true);
      setError(null);
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${busqueda.toLowerCase()}`);
      if (!res.ok) throw new Error('Pokémon no encontrado.');
      const data = await res.json();
      setPokemones([{
        id: data.id,
        nombre: data.name,
        imagen: data.sprites.front_default,
        tipos: data.types.map(t => t.type.name),
      }]);
    } catch (err) {
      setError(err.message);
      setPokemones([]);
    } finally {
      setCargando(false);
    }
  };

  const buscarPorTipo = async () => {
    if (!tipoSeleccionado) return;
    try {
      setCargando(true);
      setError(null);
      const res = await fetch(`https://pokeapi.co/api/v2/type/${tipoSeleccionado}`);
      const data = await res.json();

      const promises = data.pokemon.map(async ({ pokemon }) => {
        const res = await fetch(pokemon.url);
        const data = await res.json();
        return {
          id: data.id,
          nombre: data.name,
          imagen: data.sprites.front_default,
          tipos: data.types.map(t => t.type.name),
        };
      });

      const results = await Promise.all(promises);
      setPokemones(results);
    } catch (err) {
      setError(err.message);
      setPokemones([]);
    } finally {
      setCargando(false);
    }
  };

  const resetear = () => {
    setBusqueda('');
    setTipoSeleccionado('');
    fetchAleatorios();
  };

  return (
    <div className='pokemon-container'>
      <h2>Tus Pokémon</h2>

      <div className="filtros">
        <input
          type="text"
          placeholder="Buscar por nombre"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button onClick={buscarPorNombre}>Buscar</button>

        <select value={tipoSeleccionado} onChange={(e) => setTipoSeleccionado(e.target.value)}>
          <option value="">Filtrar por tipo</option>
          {tiposDisponibles.map(tipo => (
            <option key={tipo} value={tipo}>{tipo}</option>
          ))}
        </select>
        <button onClick={buscarPorTipo}>Filtrar</button>
        <button onClick={resetear}>Resetear</button>
      </div>

      {cargando && <div>Cargando Pokémon...</div>}
      {error && <div className="error">Error: {error}</div>}

      <div className="pokemon-list">
        {pokemones.map(pokemon => {
          const color = tipoColores[pokemon.tipos[0]] || "#ccc";
          return (
            <div
              key={pokemon.id}
              className="pokemon-card"
              style={{ borderTop: `8px solid ${color}` }}
            >
              <h3>{pokemon.nombre.charAt(0).toUpperCase() + pokemon.nombre.slice(1)}</h3>
              <img src={pokemon.imagen} alt={pokemon.nombre} />
              <p><strong>Tipos:</strong> {pokemon.tipos.join(', ')}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PokemonFetcher;
