# 🌿 EcoAction — Plateforme de Bénévolat Environnemental

Une application mobile React Native permettant aux citoyens de découvrir, rejoindre et gérer des missions de bénévolat locales (nettoyage de plages, plantation d'arbres, ateliers zéro déchet).

---

## ✨ Fonctionnalités

- **Authentification** — Connexion / Inscription utilisateur
- **Exploration des missions** — Liste avec filtres par catégorie, recherche textuelle, détail complet (date, lieu, places restantes)
- **Inscriptions** — S'inscrire ou annuler sa participation avec **Optimistic UI** (mise à jour instantanée avant confirmation serveur)
- **Mes Missions** — Agenda personnel des participations
- **Profil** — Statistiques : missions complétées, heures de bénévolat, missions à venir

---

## 🛠️ Stack Technique

| Couche | Technologie |
|---|---|
| Framework | React Native + Expo SDK (dernière version stable) |
| Navigation | Expo Router (file-based routing) |
| Langage | TypeScript (strict, no `any`) |
| UI | NativeWind (Tailwind CSS pour RN) |
| Gestion d'état & réseau | TanStack Query (React Query v5) |
| Backend | Supabase |

---

## 📁 Structure du Projet

```
ecoapp/
├── app/                          # Expo Router — routes basées sur le système de fichiers
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx             # Connexion utilisateur
│   │   └── register.tsx          # Inscription
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Liste des missions + filtres
│   │   ├── my-missions.tsx       # Agenda personnel
│   │   └── profile.tsx           # Statistiques utilisateur
│   ├── mission/
│   │   └── [id].tsx              # Détail d'une mission (route dynamique)
│   ├── _layout.tsx
│   ├── +html.tsx
│   ├── +not-found.tsx
│   └── RootNavigation.tsx
├── assets/
├── components/                   # Composants réutilisables
│   ├── __tests__/
│   ├── Button.tsx
│   ├── EmptyState.tsx
│   ├── ErrorMessage.tsx
│   ├── ExternalLink.tsx
│   ├── LoadingSpinner.tsx
│   ├── MissionCard.tsx
│   ├── MissionFilters.tsx
│   ├── SearchBar.tsx
│   ├── StatCard.tsx
│   ├── StyledText.tsx
│   └── Themed.tsx
├── constants/
├── context/
│   └── AuthContext.tsx            # Contexte d'authentification global
├── hooks/                        # Hooks TanStack Query
│   ├── useCancelEnrollment.ts
│   ├── useEnrollMission.ts       # Mutation inscription (Optimistic UI)
│   ├── useMissionDetail.ts
│   ├── useMissions.ts
│   ├── useMyMissions.ts
│   ├── useProfile.ts
│   └── useUserStats.ts
├── lib/
│   ├── api/                      # Fonctions d'appel API
│   │   ├── missions.ts
│   │   ├── participations.ts
│   │   └── users.ts
│   ├── queryClient.ts            # Configuration QueryClient (staleTime, gcTime, retry)
│   └── supabase.ts               # Client Supabase
├── types/                        # Interfaces TypeScript
│   ├── api.types.ts
│   ├── mission.types.ts
│   ├── participation.types.ts
│   └── user.types.ts
├── utils/
├── .env
├── app.json
├── global.css
├── tailwind.config.js
└── tsconfig.json
```

---

## 🚀 Installation & Lancement

### Prérequis

- Node.js ≥ 18
- npm ou yarn
- Expo CLI : `npm install -g expo-cli`
- Application **Expo Go** sur votre téléphone (iOS / Android)

### 1. Cloner le dépôt

```bash
git clone https://github.com/votre-username/ecoapp.git
cd ecoapp
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer Supabase

Créez un fichier `.env` à la racine avec vos clés Supabase :

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
```

### 4. Lancer l'application

```bash
npx expo start
```

Scannez le QR code avec **Expo Go** ou pressez `a` (Android) / `i` (iOS simulateur).

---

## 📜 Scripts disponibles

```bash
npm run start       # Lance Expo
npm run android     # Lance sur émulateur Android
npm run ios         # Lance sur simulateur iOS
npm run lint        # Lint TypeScript avec ESLint
npm run type-check  # Vérification TypeScript stricte
```

---

## ⚡ Stratégie TanStack Query

### Configuration du cache

```typescript
// lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 min — données fraîches sans re-fetch
      gcTime: 30 * 60 * 1000,     // 30 min — cache disponible hors-ligne
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});
```

### Optimistic UI — Inscription à une mission

```typescript
// hooks/useEnrollMission.ts
const { mutate: enroll } = useMutation({
  mutationFn: (payload: EnrollmentInput) => participationsApi.enroll(payload),
  onMutate: async (payload) => {
    await queryClient.cancelQueries({ queryKey: ['missions', payload.mission_id] });
    const snapshot = queryClient.getQueryData(['missions', payload.mission_id]);
    queryClient.setQueryData(['missions', payload.mission_id], (old: MissionWithUserStatus) => ({
      ...old,
      current_participants: old.current_participants + 1,
      isUserRegistered: true,
    }));
    return { snapshot };
  },
  onError: (_err, payload, ctx) => {
    queryClient.setQueryData(['missions', payload.mission_id], ctx?.snapshot);
  },
  onSettled: (_data, _err, payload) => {
    queryClient.invalidateQueries({ queryKey: ['missions', payload.mission_id] });
    queryClient.invalidateQueries({ queryKey: ['participations', payload.user_id] });
  },
});
```

---

## 🏷️ Types TypeScript

```typescript
// types/mission.types.ts
export type MissionCategory = 'cleanup' | 'planting' | 'workshop' | 'awareness' | 'recycling';

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: MissionCategory;
  location: string;
  date: string;
  duration_hours: number;
  max_participants: number;
  current_participants: number;
  image_url: string | null;
  organizer_id: string;
  created_at: string;
  updated_at: string;
}

export interface MissionWithUserStatus extends Mission {
  isUserRegistered?: boolean;
  userParticipationId?: string;
}

export interface MissionFilters {
  category?: MissionCategory;
  search?: string;
}
```

```typescript
// types/participation.types.ts
export type ParticipationStatus = 'enrolled' | 'completed' | 'cancelled';

export interface Participation {
  id: string;
  user_id: string;
  mission_id: string;
  status: ParticipationStatus;
  enrolled_at: string;
}

export interface EnrollmentInput {
  mission_id: string;
  user_id: string;
}

export interface CancelEnrollmentInput {
  participation_id: string;
}
```

```typescript
// types/user.types.ts
export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  total_missions_completed: number;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  total_missions_completed: number;
  enrolled_missions_count: number;
  upcoming_missions_count: number;
  total_hours_volunteered: number;
}
```

---

> _"Chaque geste compte. EcoAction connecte les citoyens aux causes locales."_ 🌍
