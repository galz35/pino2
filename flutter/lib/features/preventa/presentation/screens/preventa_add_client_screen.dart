import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/database/local_cache_repository.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';

class PreventaAddClientScreen extends ConsumerStatefulWidget {
  const PreventaAddClientScreen({super.key});

  @override
  ConsumerState<PreventaAddClientScreen> createState() => _PreventaAddClientScreenState();
}

class _PreventaAddClientScreenState extends ConsumerState<PreventaAddClientScreen> {
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  Position? _currentPosition;
  bool _gettingGps = false;

  Future<void> _getCurrentLocation() async {
    setState(() => _gettingGps = true);
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      
      if (permission == LocationPermission.whileInUse || permission == LocationPermission.always) {
        final pos = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
        setState(() => _currentPosition = pos);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error GPS: $e')));
      }
    } finally {
      if (mounted) setState(() => _gettingGps = false);
    }
  }

  void _saveClient() async {
    if (_nameCtrl.text.isEmpty) return;

    final authState = ref.read(authControllerProvider);
    final storeId = authState.session?.user.primaryStoreId;

    final payload = {
      'name': _nameCtrl.text,
      'phone': _phoneCtrl.text,
      'address': _addressCtrl.text,
      'latitude': _currentPosition?.latitude,
      'longitude': _currentPosition?.longitude,
      'storeId': storeId,
      'createdAt': DateTime.now().toIso8601String(),
    };

    await ref.read(localCacheRepositoryProvider).enqueueSyncAction(
      method: 'POST',
      endpoint: '/clients',
      storeId: storeId,
      operationType: 'CREATE_CLIENT',
      payload: payload,
    );

    if (!mounted) return;
    context.pop();
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Cliente guardado localmente.')));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Nuevo Cliente')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          TextField(
            controller: _nameCtrl,
            decoration: const InputDecoration(labelText: 'Nombre Completo / Negocio', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _phoneCtrl,
            decoration: const InputDecoration(labelText: 'Teléfono', border: OutlineInputBorder()),
            keyboardType: TextInputType.phone,
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _addressCtrl,
            decoration: const InputDecoration(labelText: 'Dirección Exacta', border: OutlineInputBorder()),
            maxLines: 3,
          ),
          const SizedBox(height: 24),
          
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.blue.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.blue.shade200)
            ),
            child: Column(
              children: [
                 const Row(
                   children: [
                     Icon(Icons.location_on, color: Colors.blue),
                     SizedBox(width: 8),
                     Text('Geolocalización (Obligatorio)', style: TextStyle(fontWeight: FontWeight.bold)),
                   ],
                 ),
                 const SizedBox(height: 12),
                 if (_currentPosition != null)
                   Text('Lat: ${_currentPosition!.latitude}, Lng: ${_currentPosition!.longitude}', style: const TextStyle(fontFamily: 'monospace'))
                 else
                   const Text('No se ha capturado la ubicación todavía.'),
                 const SizedBox(height: 12),
                 ElevatedButton.icon(
                   onPressed: _gettingGps ? null : _getCurrentLocation,
                   icon: _gettingGps ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.gps_fixed),
                   label: Text(_gettingGps ? 'Obteniendo...' : 'CAPTURAR POSICIÓN ACTUAL'),
                 )
              ],
            ),
          ),

          const SizedBox(height: 40),
          
          ElevatedButton(
            onPressed: _currentPosition == null ? null : _saveClient,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF047857),
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 54),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))
            ),
            child: const Text('GUARDAR CLIENTE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          )
        ],
      ),
    );
  }
}
