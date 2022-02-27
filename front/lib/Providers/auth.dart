import 'dart:convert';

import 'package:flutter/widgets.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:http/http.dart' as http;

import '../Models/http_exception.dart';
import '../Models/user_login.dart';

final tokenValue = StateProvider<String?>((ref) => null);
final nonce = StateProvider<String?>((ref) => null);

class Auth with ChangeNotifier {
  Future<void> getNonce(WidgetRef ref, dynamic wallet) async {
    final pubKey = ref.watch(wallet)?.toBase58();
    final _baseUrl = dotenv.get('BASE_URL');
    final url = Uri.parse([_baseUrl, '/user/start-authentication'].join());
    try {
      final response = await http.post(url,
          body: json.encode(
            {'walletAddress': pubKey},
          ),
          headers: <String, String>{
            'Authorization': 'Bearer ' + ref.watch(tokenValue).state!
          });
      final Map responseBody = json.decode(response.body);
      if (responseBody['error'] != null) {
        throw HttpException(responseBody['message'] ?? 'Error');
      }
      ref.watch(nonce).state = responseBody['nonce'];
    } catch (error) {
      rethrow;
    }
  }

  Future<String?> clientLogin(WidgetRef ref) async {
    final _baseUrl = dotenv.get('BASE_URL');
    final url = Uri.parse([_baseUrl, '/client/login'].join());

    String username = dotenv.get('APPLICATION_ID');
    String password = dotenv.get('APPLICATION_SECRET');
    String basicAuth = base64Encode(utf8.encode('$username:$password'));
    try {
      final response = await http.post(url,
          body: json.encode(null),
          headers: <String, String>{'Authorization': basicAuth});
      final Map responseBody = json.decode(response.body);
      final responseData = UserLogin.fromJson(responseBody);
      if (responseData.error != null) {
        throw HttpException(responseData.message ?? 'No error provided');
      }
      final _tokenValue = responseData.tokenValue;
      ref.watch(tokenValue).state = _tokenValue;
      return _tokenValue;
    } catch (error) {
      rethrow;
    }
  }

  Future<void> completeAuth(WidgetRef ref, dynamic wallet, String walletType,
      String signature) async {
    final pubKey = ref.watch(wallet)?.toBase58();
    final _baseUrl = dotenv.get('BASE_URL');
    final url = Uri.parse([_baseUrl, '/user/complete-authentication'].join());
    try {
      final response = await http.post(url,
          body: json.encode(
            {
              'walletAddress': pubKey,
              'signature': signature,
              'walletType': walletType
            },
          ),
          headers: <String, String>{
            'Authorization': 'Bearer ' + ref.watch(tokenValue).state!
          });
      final responseData = json.decode(response.body);
      if (responseData['error'] != null) {
        throw HttpException(responseData!.error!.message);
      }
    } catch (error) {
      rethrow;
    }
  }
}
