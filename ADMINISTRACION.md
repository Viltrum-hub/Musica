# Administración de ANDROMEDA

El panel está en `index.html?page=admin`. El acceso se valida con Supabase Auth y la tabla `public.catalog_admins`. Las políticas RLS protegen el catálogo y las subidas incluso si se intenta usar directamente la API.

## Dar permiso a una cuenta

1. La persona se registra en ANDROMEDA y confirma su correo si se le solicita.
2. En el proyecto **Sitio Musica** de Supabase, abre **SQL Editor**.
3. Reemplaza el correo y ejecuta:

```sql
insert into public.catalog_admins (user_id)
select id from auth.users
where lower(email) = lower('correo@ejemplo.com')
on conflict (user_id) do nothing;
```

Comprueba la asignación sin publicar el resultado:

```sql
select u.email, a.created_at
from public.catalog_admins a
join auth.users u on u.id = a.user_id
where lower(u.email) = lower('correo@ejemplo.com');
```

Si no devuelve ninguna fila, comprueba que la cuenta ya existe en **Authentication → Users** y que el correo es correcto. Recarga ANDROMEDA y abre **Mi perfil → Panel de administración**.

No se ha elegido ni ascendido automáticamente ninguna de las cuentas existentes. No existe un botón público para otorgarse este permiso. Tener una cuenta en la web y tener acceso al proyecto de Supabase son permisos diferentes.

## Retirar un permiso

```sql
delete from public.catalog_admins
where user_id in (
 select id from auth.users
 where lower(email) = lower('correo@ejemplo.com')
);
```

Las siguientes operaciones se deniegan en la base de datos inmediatamente. La pantalla vuelve a comprobar el permiso al recuperar el foco, cambiar de sesión, intentar guardar y cada 45 segundos mientras está abierta.

## Catálogo

- **Canciones:** buscar, filtrar, crear, editar, publicar, guardar borradores y eliminar registros. Se comprueban duplicados por artista y título normalizado, además de audio duplicado.
- **Artistas:** crear y editar perfil, género, biografía y portada. Un artista con canciones no se puede eliminar hasta reasignarlas o retirarlas. Reemplazar su portada actualiza las de sus canciones.
- **Álbumes:** selecciones agrupadas por artista; se forman automáticamente con canciones publicadas. No son discos de estudio con metadatos de lanzamiento.
- **Universos:** consulta de los seis universos y sus canciones; la identidad visual se mantiene en los estilos del proyecto.
- **Borradores:** ocultos en la API pública y en Explorar, Artistas y Álbumes. Los archivos de Storage son públicos si se conoce su URL; un borrador no convierte el audio en un archivo privado.

Las modificaciones de otra sesión se ven al recargar o volver a abrir una sección, con caché de catálogo de hasta 30 segundos. Guardar desde el panel invalida la caché de esa pestaña. El reproductor que ya tiene una canción cargada no se interrumpe al editar el catálogo.

## Archivos

Los audios existentes siguen en GitHub. No se ha migrado el GB de archivos existente ni cambiado el plan de Supabase. Las nuevas subidas usan `andromeda-audio` (25 MB/archivo) y `andromeda-covers` (5 MB/archivo). Solo admins pueden subir o borrar en estos buckets.

Las portadas aceptan JPG, PNG y WebP. Usa las portadas con marca ANDROMEDA ya preparadas o sube una nueva con el mismo acabado; el panel no genera retratos automáticamente.

Al eliminar un registro no se borran sus archivos ni las copias de una canción ya guardadas en favoritos o playlists. Esto evita eliminar recursos compartidos. Una limpieza de archivos requiere revisar antes sus referencias. La cuota de almacenamiento y transferencia es la del plan vigente del proyecto.

## Configuración de base de datos

`database/catalog-admin.sql` y `database/catalog-artwork.sql` documentan el esquema aplicado. Ya están ejecutados en el proyecto de música: no volver a ejecutarlos completos sobre el mismo esquema. Los metadatos iniciales se importaron sin cambiar los archivos de audio.

Las credenciales de servicio y las claves secretas no deben incluirse en HTML ni JavaScript. El navegador usa únicamente la clave pública del proyecto y la sesión de la cuenta.
