import 'dart:typed_data';

import 'package:js/js.dart';
import 'package:nft_game/js/solana_web3/transaction.dart';
import 'package:nft_game/js/solana_web3/public_key.dart';

@JS('wallet.phantom.connect')
external Future<PublicKey> connect();

@JS('wallet.phantom.disconnect')
external Future<PublicKey> disconnect();

@JS('wallet.phantom.isInstalled')
external bool? isInstalled();

@JS('wallet.phantom.signTransaction')
external Future<String> signTransaction(Transaction tx);

@anonymous
@JS('wallet.phantom.SignedMessage')
class SignedMessage {
  external factory SignedMessage({Uint8List signature, PublicKey publicKey});
  external Uint8List get signature;
  external PublicKey get publicKey;
}

@JS('wallet.phantom.signMessage')
external Future<String> signMessage(String msg);
